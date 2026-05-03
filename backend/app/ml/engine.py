import numpy as np
import pandas as pd
import joblib
import shap
import os
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import roc_auc_score, f1_score, classification_report
from loguru import logger

from app.core.config import settings


FEATURE_NAMES = [
    "anciennete_mobile_mois",
    "nb_tx_entrees_30j",
    "montant_moyen_entree_gnf",
    "regularite_remboursements",
    "nb_tx_diaspora_6mois",
    "ratio_depense_revenu",
    "solde_moyen_gnf",
    "sexe_enc",
    "age",
    "type_activite_enc",
    "zone_geographique_enc",
]

FEATURE_LABELS_FR = {
    "regularite_remboursements": "Régularité remboursements",
    "solde_moyen_gnf": "Solde moyen mobile",
    "montant_moyen_entree_gnf": "Montant moyen entrées",
    "anciennete_mobile_mois": "Ancienneté mobile money",
    "nb_tx_entrees_30j": "Nb transactions entrées",
    "ratio_depense_revenu": "Ratio dépenses/revenus",
    "nb_tx_diaspora_6mois": "Virements diaspora",
    "age": "Âge",
    "sexe_enc": "Genre",
    "type_activite_enc": "Type d'activité",
    "zone_geographique_enc": "Zone géographique",
}


class MLEngine:
    """Moteur ML pour le scoring de crédit guinéen."""

    def __init__(self):
        self.models_path = Path(settings.ML_MODELS_PATH)
        self.models_path.mkdir(parents=True, exist_ok=True)
        self.model = None
        self.scaler = None
        self.encoders: Dict[str, LabelEncoder] = {}
        self.model_version = "v1.0"
        self.model_name = "gradient_boosting"
        self._load_or_train()

    def _load_or_train(self):
        model_file = self.models_path / "model_gb.joblib"
        if model_file.exists():
            logger.info("Chargement du modèle existant...")
            self._load_model()
        else:
            logger.info("Entraînement initial du modèle...")
            df = self.generate_synthetic_dataset(n=1000)
            self.train(df)

    # ─── Génération du dataset synthétique guinéen ────────────────────────────
    def generate_synthetic_dataset(self, n: int = 1000, seed: int = 42) -> pd.DataFrame:
        np.random.seed(seed)
        zones = ["conakry", "kindia", "boke", "labe", "mamou", "faranah", "kankan", "nzerekore"]
        activites = ["commerce", "transport", "artisanat", "agriculture", "services"]

        df = pd.DataFrame({
            "anciennete_mobile_mois": np.random.randint(3, 96, n),
            "nb_tx_entrees_30j": np.random.poisson(12, n).clip(1, 60),
            "montant_moyen_entree_gnf": np.random.lognormal(14.5, 1.2, n).clip(50000, 5_000_000),
            "regularite_remboursements": np.random.beta(5, 2, n),
            "nb_tx_diaspora_6mois": np.random.poisson(3, n).clip(0, 20),
            "ratio_depense_revenu": np.random.beta(3, 4, n) * 1.5,
            "solde_moyen_gnf": np.random.lognormal(13.5, 1.3, n).clip(10000, 3_000_000),
            "sexe": np.random.choice(["M", "F"], n, p=[0.55, 0.45]),
            "age": np.random.normal(35, 9, n).clip(18, 70).astype(int),
            "type_activite": np.random.choice(activites, n, p=[0.40, 0.20, 0.20, 0.12, 0.08]),
            "zone_geographique": np.random.choice(zones, n, p=[0.35, 0.10, 0.10, 0.10, 0.08, 0.09, 0.10, 0.08]),
        })

        # Génération de la variable cible avec logique réaliste
        score_latent = (
            0.28 * df["regularite_remboursements"]
            + 0.19 * (df["solde_moyen_gnf"] / df["solde_moyen_gnf"].max())
            + 0.12 * (df["montant_moyen_entree_gnf"] / df["montant_moyen_entree_gnf"].max())
            + 0.10 * (df["anciennete_mobile_mois"] / 96)
            + 0.08 * (df["nb_tx_entrees_30j"] / 60)
            - 0.15 * df["ratio_depense_revenu"]
            + 0.05 * (df["nb_tx_diaspora_6mois"] / 20)
            + 0.03 * (df["sexe"] == "F").astype(float)
        )
        score_latent += np.random.normal(0, 0.05, n)
        defaut_prob = 1 / (1 + np.exp(5 * (score_latent - 0.5)))
        df["defaut_passe"] = (np.random.uniform(0, 1, n) < defaut_prob).astype(int)

        logger.info(f"Dataset synthétique : {n} lignes, taux défaut = {df['defaut_passe'].mean():.2%}")
        return df

    # ─── Prétraitement ────────────────────────────────────────────────────────
    def preprocess(self, df: pd.DataFrame, fit: bool = False) -> pd.DataFrame:
        df = df.copy()
        # Encodage binaire sexe
        df["sexe_enc"] = (df["sexe"] == "F").astype(int)

        for col in ["type_activite", "zone_geographique"]:
            if fit:
                le = LabelEncoder()
                df[f"{col}_enc"] = le.fit_transform(df[col].astype(str))
                self.encoders[col] = le
            else:
                le = self.encoders.get(col)
                if le:
                    df[f"{col}_enc"] = le.transform(df[col].astype(str))
                else:
                    df[f"{col}_enc"] = 0

        return df[FEATURE_NAMES]

    # ─── Entraînement ─────────────────────────────────────────────────────────
    def train(self, df: pd.DataFrame) -> Dict[str, float]:
        X = self.preprocess(df, fit=True)
        y = df["defaut_passe"].astype(int)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=4,
            min_samples_leaf=20,
            subsample=0.8,
            random_state=42,
        )
        self.model.fit(X_train, y_train)

        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        y_pred = self.model.predict(X_test)
        auc = roc_auc_score(y_test, y_pred_proba)
        f1 = f1_score(y_test, y_pred)
        cv_auc = cross_val_score(self.model, X, y, cv=5, scoring="roc_auc").mean()

        metrics = {"auc_roc": round(auc, 4), "f1_score": round(f1, 4), "cv_auc": round(cv_auc, 4)}
        logger.info(f"Modèle entraîné : {metrics}")

        # Sauvegarde
        joblib.dump(self.model, self.models_path / "model_gb.joblib")
        joblib.dump(self.encoders, self.models_path / "encoders.joblib")
        return metrics

    def _load_model(self):
        self.model = joblib.load(self.models_path / "model_gb.joblib")
        self.encoders = joblib.load(self.models_path / "encoders.joblib")

    # ─── Scoring d'un client ──────────────────────────────────────────────────
    def score_client(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        df = pd.DataFrame([client_data])
        X = self.preprocess(df, fit=False)

        proba_defaut = float(self.model.predict_proba(X)[0][1])
        score = round((1 - proba_defaut) * 100, 1)

        # Décision et montant recommandé
        if score >= 65:
            decision = "approuve"
            montant_rec = self._calcul_montant(score, client_data.get("solde_moyen_gnf", 0))
        elif score >= 45:
            decision = "en_attente"
            montant_rec = self._calcul_montant(score * 0.6, client_data.get("solde_moyen_gnf", 0))
        else:
            decision = "refuse"
            montant_rec = None

        if score >= 70:
            categorie = "faible"
        elif score >= 50:
            categorie = "modéré"
        else:
            categorie = "élevé"

        # SHAP
        top_features = self._compute_shap(X)
        interpretation = self._generate_interpretation(score, top_features, client_data)

        return {
            "score": score,
            "probabilite_defaut": round(proba_defaut, 4),
            "decision": decision,
            "montant_recommande_gnf": montant_rec,
            "categorie_risque": categorie,
            "top_features": top_features,
            "model_version": self.model_version,
            "model_name": self.model_name,
            "interpretation": interpretation,
        }

    def _calcul_montant(self, score: float, solde_moyen: float) -> float:
        """Calcul du montant recommandé basé sur le score et le solde."""
        base = max(solde_moyen * 3, 500_000)
        multiplicateur = score / 100
        return round(base * multiplicateur / 100_000) * 100_000

    def _compute_shap(self, X: pd.DataFrame) -> List[Dict]:
        try:
            explainer = shap.TreeExplainer(self.model)
            shap_values = explainer.shap_values(X)
            values = shap_values[0] if shap_values.ndim > 1 else shap_values[0]

            features = []
            for i, feat in enumerate(FEATURE_NAMES):
                impact = float(values[i])
                features.append({
                    "feature": feat,
                    "label": FEATURE_LABELS_FR.get(feat, feat),
                    "valeur": float(X.iloc[0][feat]),
                    "impact": round(abs(impact), 4),
                    "direction": "positif" if impact < 0 else "negatif",
                })
            features.sort(key=lambda x: x["impact"], reverse=True)
            return features[:5]
        except Exception as e:
            logger.warning(f"SHAP error: {e}")
            return []

    def _generate_interpretation(
        self, score: float, features: List[Dict], data: Dict
    ) -> str:
        nom = data.get("nom_complet", "Ce client")
        if score >= 65:
            verdict = "présente un profil de crédit favorable"
        elif score >= 45:
            verdict = "présente un profil de crédit à surveiller"
        else:
            verdict = "présente un risque de crédit élevé"

        top = features[0]["label"] if features else "la régularité"
        direction = features[0]["direction"] if features else "positif"
        impact_text = "favorise" if direction == "positif" else "pénalise"

        return (
            f"{nom} {verdict} avec un score de {score}/100. "
            f"Le facteur le plus déterminant est '{top}' qui {impact_text} la décision. "
            f"Ce score est basé sur l'analyse de {len(FEATURE_NAMES)} variables mobile money."
        )


# Instance singleton
_ml_engine: Optional[MLEngine] = None


def get_ml_engine() -> MLEngine:
    global _ml_engine
    if _ml_engine is None:
        _ml_engine = MLEngine()
    return _ml_engine
