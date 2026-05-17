from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ─── Enums Pydantic ───────────────────────────────────────────────────────────
class UserRoleSchema(str, Enum):
    admin = "admin"
    agent = "agent"
    viewer = "viewer"
    client = "client"


class TypeActiviteSchema(str, Enum):
    commerce = "commerce"
    transport = "transport"
    artisanat = "artisanat"
    agriculture = "agriculture"
    services = "services"


class ZoneGeoSchema(str, Enum):
    conakry = "conakry"
    kindia = "kindia"
    boke = "boke"
    labe = "labe"
    mamou = "mamou"
    faranah = "faranah"
    kankan = "kankan"
    nzerekore = "nzerekore"


class DecisionCreditSchema(str, Enum):
    approuve = "approuve"
    refuse = "refuse"
    en_attente = "en_attente"


class ClientStatusSchema(str, Enum):
    en_attente = "en_attente"
    valide = "valide"
    refuse = "refuse"


# ─── Auth ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    identifier: str  # Email ou Téléphone
    password: str


class UserResponse(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    full_name: str
    role: UserRoleSchema
    is_active: bool
    institution: Optional[str] = None
    client_id: Optional[int] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # secondes
    user: UserResponse


class RefreshRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    refresh_token: str


# ─── User ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    password: str
    full_name: str
    role: UserRoleSchema = UserRoleSchema.agent
    institution: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Le mot de passe doit avoir au moins 8 caractères")
        return v


class UserUpdate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    full_name: Optional[str] = None
    institution: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRoleSchema] = None




# ─── Client ───────────────────────────────────────────────────────────────────
class ClientCreate(BaseModel):
    nom_complet: str
    telephone: str
    telephone_secondaire: Optional[str] = None
    sexe: str
    age: int
    zone_geographique: ZoneGeoSchema
    type_activite: TypeActiviteSchema
    anciennete_mobile_mois: int
    nb_tx_entrees_30j: int
    montant_moyen_entree_gnf: float
    regularite_remboursements: float
    nb_tx_diaspora_6mois: int
    ratio_depense_revenu: float
    solde_moyen_gnf: float
    defaut_passe: bool = False
    notes: Optional[str] = None

    @field_validator("sexe")
    @classmethod
    def valid_sexe(cls, v: str) -> str:
        if v.upper() not in ("M", "F"):
            raise ValueError("Sexe doit être M ou F")
        return v.upper()

    @field_validator("age")
    @classmethod
    def valid_age(cls, v: int) -> int:
        if not (18 <= v <= 80):
            raise ValueError("L'âge doit être entre 18 et 80 ans")
        return v

    @field_validator("regularite_remboursements")
    @classmethod
    def valid_regularite(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError("La régularité doit être entre 0 et 1")
        return v

    @field_validator("ratio_depense_revenu")
    @classmethod
    def valid_ratio(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Le ratio dépense/revenu ne peut pas être négatif")
        return v

    @field_validator("telephone_secondaire", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if v == "":
            return None
        return v


class ClientUpdate(BaseModel):
    nom_complet: Optional[str] = None
    telephone: Optional[str] = None
    status: Optional[ClientStatusSchema] = None
    notes: Optional[str] = None
    anciennete_mobile_mois: Optional[int] = None
    nb_tx_entrees_30j: Optional[int] = None
    montant_moyen_entree_gnf: Optional[float] = None
    regularite_remboursements: Optional[float] = None
    nb_tx_diaspora_6mois: Optional[int] = None
    ratio_depense_revenu: Optional[float] = None
    solde_moyen_gnf: Optional[float] = None
    telephone_secondaire: Optional[str] = None

    @field_validator("telephone_secondaire", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if v == "":
            return None
        return v


class ClientResponse(BaseModel):
    id: int
    nom_complet: str
    telephone: str
    telephone_secondaire: Optional[str] = None
    sexe: str
    age: int
    zone_geographique: ZoneGeoSchema
    type_activite: TypeActiviteSchema
    status: ClientStatusSchema
    anciennete_mobile_mois: int
    nb_tx_entrees_30j: int
    montant_moyen_entree_gnf: float
    regularite_remboursements: float
    nb_tx_diaspora_6mois: int
    ratio_depense_revenu: float
    solde_moyen_gnf: float
    defaut_passe: bool
    notes: Optional[str]
    agent_id: Optional[int] = None
    agent_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# ─── Scoring ──────────────────────────────────────────────────────────────────
class ScoringRequest(BaseModel):
    """Données pour scorer un client existant ou ad-hoc"""
    client_id: Optional[int] = None  # si client déjà en DB
    # Sinon, données directes :
    anciennete_mobile_mois: Optional[int] = None
    nb_tx_entrees_30j: Optional[int] = None
    montant_moyen_entree_gnf: Optional[float] = None
    regularite_remboursements: Optional[float] = None
    nb_tx_diaspora_6mois: Optional[int] = None
    ratio_depense_revenu: Optional[float] = None
    solde_moyen_gnf: Optional[float] = None
    sexe: Optional[str] = None
    age: Optional[int] = None
    type_activite: Optional[TypeActiviteSchema] = None
    zone_geographique: Optional[ZoneGeoSchema] = None
    defaut_passe: Optional[bool] = False


class ShapFeature(BaseModel):
    feature: str
    valeur: float
    impact: float
    direction: str  # "positif" | "negatif"


class ScoringResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    score: float                          # 0 – 100
    probabilite_defaut: float             # 0.0 – 1.0
    decision: DecisionCreditSchema
    montant_recommande_gnf: Optional[float]
    categorie_risque: str                 # "faible" | "moyen" | "élevé"
    top_features: List[ShapFeature]
    model_version: str
    score_history_id: Optional[int]
    interpretation: str                   # texte explicatif en français


class ScoreHistoryResponse(BaseModel):
    id: int
    client_id: int
    client_name: Optional[str] = None
    agent_id: Optional[int] = None
    agent_name: Optional[str] = None
    score: float
    probabilite_defaut: float
    decision: DecisionCreditSchema
    montant_recommande_gnf: Optional[float]
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SystemSettingsSchema(BaseModel):
    approval_threshold: float = 65.0
    model_version: str = "v1.0.2"
    maintenance_mode: bool = False
    max_loan_amount_gnf: float = 50000000.0


# ─── Dashboard stats ──────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_clients: int
    scores_ce_mois: int
    taux_approbation: float
    score_moyen: float
    taux_defaut_predit: float
    distribution_scores: Dict[str, int]
    repartition_zones: Dict[str, int]
    repartition_activites: Dict[str, int]
    evolution_mensuelle: List[Dict[str, Any]]


# ─── Pagination ───────────────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int
