from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey,
    Enum, Text, JSON, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.db.session import Base


# ─── Enums ────────────────────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    admin = "admin"
    agent = "agent"
    viewer = "viewer"
    client = "client"


class TypeActivite(str, enum.Enum):
    commerce = "commerce"
    transport = "transport"
    artisanat = "artisanat"
    agriculture = "agriculture"
    services = "services"


class ZoneGeographique(str, enum.Enum):
    conakry = "conakry"
    kindia = "kindia"
    boke = "boke"
    labe = "labe"
    mamou = "mamou"
    faranah = "faranah"
    kankan = "kankan"
    nzerekore = "nzerekore"


class DecisionCredit(str, enum.Enum):
    approuve = "approuve"
    refuse = "refuse"
    en_attente = "en_attente"


class ClientStatus(str, enum.Enum):
    en_attente = "en_attente"
    valide = "valide"
    refuse = "refuse"


# ─── Modèle User ──────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True) # Peut être nul pour un client
    telephone = Column(String(20), unique=True, index=True, nullable=True) # Pour les clients
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.agent, nullable=False)
    is_active = Column(Boolean, default=True)
    institution = Column(String(255), nullable=True)  # CRG, FINADEV, etc.
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relations
    score_histories = relationship("ScoreHistory", back_populates="agent")
    clients_managed = relationship("Client", back_populates="agent", foreign_keys="[Client.agent_id]")
    client_profile = relationship("Client", back_populates="user_account", foreign_keys="[User.client_id]")


# ─── Modèle Client (Micro-Entrepreneur) ───────────────────────────────────────
class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    # Identité
    nom_complet = Column(String(255), nullable=False)
    telephone = Column(String(20), unique=True, nullable=False)
    telephone_secondaire = Column(String(20), unique=True, nullable=True) # Nouveau: MTN ou Orange
    sexe = Column(String(1), nullable=False)  # M / F
    age = Column(Integer, nullable=False)
    zone_geographique = Column(Enum(ZoneGeographique), nullable=False)
    type_activite = Column(Enum(TypeActivite), nullable=False)

    # Données mobile money (12 variables du projet)
    anciennete_mobile_mois = Column(Integer, nullable=False)
    nb_tx_entrees_30j = Column(Integer, nullable=False)
    montant_moyen_entree_gnf = Column(Float, nullable=False)
    regularite_remboursements = Column(Float, nullable=False)  # 0.0 – 1.0
    nb_tx_diaspora_6mois = Column(Integer, nullable=False)
    ratio_depense_revenu = Column(Float, nullable=False)
    solde_moyen_gnf = Column(Float, nullable=False)
    defaut_passe = Column(Boolean, default=False)

    # Méta
    status = Column(Enum(ClientStatus), default=ClientStatus.en_attente, nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    notes = Column(Text, nullable=True)

    # Relations
    agent = relationship("User", back_populates="clients_managed", foreign_keys=[agent_id])
    user_account = relationship("User", back_populates="client_profile", uselist=False, foreign_keys="[User.client_id]")
    score_histories = relationship(
        "ScoreHistory", back_populates="client", order_by="ScoreHistory.created_at.desc()"
    )

    __table_args__ = (
        Index("ix_clients_zone_type", "zone_geographique", "type_activite"),
        Index("ix_clients_agent", "agent_id"),
    )


# ─── Modèle ScoreHistory ──────────────────────────────────────────────────────
class ScoreHistory(Base):
    __tablename__ = "score_histories"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Résultats du scoring
    score = Column(Float, nullable=False)           # 0 – 100
    probabilite_defaut = Column(Float, nullable=False)  # 0.0 – 1.0
    decision = Column(Enum(DecisionCredit), nullable=False)
    montant_recommande_gnf = Column(Float, nullable=True)

    # Explication SHAP (top features)
    shap_values = Column(JSON, nullable=True)
    feature_importances = Column(JSON, nullable=True)

    # Modèle utilisé
    model_version = Column(String(50), nullable=False, default="v1.0")
    model_name = Column(String(100), nullable=False, default="gradient_boosting")

    # Snapshot des données au moment du scoring
    input_snapshot = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    client = relationship("Client", back_populates="score_histories")
    agent = relationship("User", back_populates="score_histories")

    __table_args__ = (
        Index("ix_scores_client", "client_id"),
        Index("ix_scores_created", "created_at"),
    )
