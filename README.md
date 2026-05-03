# Moteur de Scoring de Crédit Alternatif — Guinée 🇬🇳

Système de scoring de crédit basé sur les données mobile money pour les
micro-entrepreneurs guinéens non-bancarisés.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + TailwindCSS + Recharts |
| Backend | FastAPI + SQLAlchemy (async) + Pydantic v2 |
| ML | Scikit-learn + SHAP + Joblib + MLflow |
| Base de données | PostgreSQL 15 |
| Cache | Redis 7 |
| Infra | Docker Compose + Nginx |

## Structure du projet

```
scoring-guinee/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Routes FastAPI
│   │   ├── core/               # Config, sécurité JWT
│   │   ├── db/                 # Session SQLAlchemy
│   │   ├── ml/                 # ML Engine + SHAP
│   │   ├── models/             # Modèles SQLAlchemy
│   │   ├── schemas/            # Schémas Pydantic
│   │   ├── services/           # Logique métier
│   │   └── main.py
│   ├── alembic/                # Migrations DB
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/         # Composants React
│       ├── pages/              # Pages (Dashboard, Scoring, Clients)
│       ├── services/           # Appels API
│       └── store/              # État global Zustand
├── nginx/                      # Config reverse proxy
├── scripts/                    # Seed DB, utilitaires
└── docker-compose.yml
```

## Démarrage rapide

### 1. Cloner et configurer

```bash
git clone <repo>
cd scoring-guinee
cp .env.example .env
# Éditer .env avec vos secrets
```

### 2. Lancer avec Docker

```bash
docker compose up -d
```

### 3. Initialiser la base de données

```bash
docker compose exec backend python /app/scripts/seed_admin.py
```

### 4. Accéder à l'application

| Service | URL |
|---------|-----|
| Application | http://localhost |
| API Docs | http://localhost/docs |
| Backend direct | http://localhost:8000 |
| Frontend direct | http://localhost:5173 |

### Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@scoring-guinee.gn | Admin2024! |
| Agent | agent@crg-guinee.gn | Agent2024! |

⚠️ **Changer les mots de passe en production !**

## Variables du modèle ML

Le modèle utilise 12 variables issues des données mobile money :

| Variable | Description | Impact |
|----------|-------------|--------|
| regularite_remboursements | Régularité des paiements (0-1) | 28% |
| solde_moyen_gnf | Solde moyen sur 6 mois | 19% |
| montant_moyen_entree_gnf | Revenu moyen mensuel | 12% |
| anciennete_mobile_mois | Ancienneté du compte | 10% |
| nb_tx_entrees_30j | Fréquence des revenus | 8% |
| ratio_depense_revenu | Ratio d'endettement | -15% |
| ... | ... | ... |

## Performance du modèle

| Modèle | AUC-ROC | F1 Score |
|--------|---------|----------|
| Gradient Boosting | **0.872** | 0.581 |
| Random Forest | 0.853 | 0.549 |
| Régression Logistique | 0.781 | 0.423 |

Le score FICO proxy sur populations non-bancarisées est estimé à **0.71**.

## Rôles utilisateurs

- **Admin** : accès total, gestion des utilisateurs
- **Agent** : création/scoring clients, voir ses propres clients
- **Viewer** : lecture seule du dashboard

## Développement

```bash
# Backend seul (avec PostgreSQL local)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend seul
cd frontend
npm install
npm run dev
```

## Phases de développement

- [x] Phase 1 : Fondations (Docker, FastAPI, PostgreSQL, ML Engine)
- [ ] Phase 2 : Frontend React complet
- [ ] Phase 3 : Export PDF des rapports
- [ ] Phase 4 : Tests automatisés
- [ ] Phase 5 : Déploiement production
