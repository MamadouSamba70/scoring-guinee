from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import io
from sqlalchemy import select, func, update, delete

from app.db.session import get_db
from app.core.security import (
    get_current_user, require_admin,
    create_access_token, create_refresh_token, decode_token
)
from app.schemas.schemas import (
    LoginRequest, TokenResponse, RefreshRequest,
    UserCreate, UserUpdate, UserResponse,
    ClientCreate, ClientUpdate, ClientResponse,
    ScoringRequest, ScoringResponse,
    DashboardStats, PaginatedResponse,
    ScoreHistoryResponse, SystemSettingsSchema
)
from app.services.user_service import UserService
from app.services.client_service import ClientService
from app.models.models import ScoreHistory
from app.ml.engine import get_ml_engine
from app.core.config import settings

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await UserService.authenticate(db, payload.identifier, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiant ou mot de passe incorrect",
        )
    extra = {"role": user.role, "full_name": user.full_name, "client_id": user.client_id}
    return TokenResponse(
        access_token=create_access_token(user.id, extra),
        refresh_token=create_refresh_token(user.id),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/auth/refresh", response_model=TokenResponse, tags=["Auth"])
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Token de rafraîchissement invalide")
    user = await UserService.get_by_id(db, int(decoded["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur invalide")
    extra = {"role": user.role, "full_name": user.full_name}
    return TokenResponse(
        access_token=create_access_token(user.id, extra),
        refresh_token=create_refresh_token(user.id),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/auth/me", response_model=UserResponse, tags=["Auth"])
async def get_me(current_user=Depends(get_current_user)):
    return current_user


# ═══════════════════════════════════════════════════════════════════════════════
# USERS (admin only)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/users", response_model=UserResponse, tags=["Users"])
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    existing = await UserService.get_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email déjà utilisé")
    return await UserService.create(db, payload)


@router.get("/users", response_model=List[UserResponse], tags=["Users"])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    return await UserService.list_all(db, skip=skip, limit=limit)


@router.patch("/users/{user_id}", response_model=UserResponse, tags=["Users"])
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return await UserService.update(db, user, payload)


# ═══════════════════════════════════════════════════════════════════════════════
# CLIENTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/clients", response_model=ClientResponse, status_code=201, tags=["Clients"])
async def create_client(
    payload: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing = await ClientService.get_by_telephone(db, payload.telephone)
    if existing:
        raise HTTPException(status_code=409, detail="Numéro de téléphone déjà enregistré")
    return await ClientService.create(db, payload, agent_id=current_user.id)


@router.get("/clients", tags=["Clients"])
async def list_clients(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    zone: Optional[str] = None,
    activite: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    agent_filter = None if current_user.role == "admin" else current_user.id
    clients, total = await ClientService.list_paginated(
        db, page=page, per_page=per_page, zone=zone, activite=activite, agent_id=agent_filter
    )
    pages = (total + per_page - 1) // per_page
    return {
        "items": [ClientResponse.model_validate(c) for c in clients],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/clients/{client_id}", response_model=ClientResponse, tags=["Clients"])
async def get_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    client = await ClientService.get_by_id(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return client


@router.patch("/clients/{client_id}", response_model=ClientResponse, tags=["Clients"])
async def update_client(
    client_id: int,
    payload: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    client = await ClientService.get_by_id(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return await ClientService.update(db, client, payload)


@router.delete("/clients/{client_id}", status_code=204, tags=["Clients"])
async def delete_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    success = await ClientService.delete(db, client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client introuvable")


@router.get("/clients/{client_id}/scores", tags=["Clients"])
async def get_client_scores(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await ClientService.get_score_history(db, client_id)


# ═══════════════════════════════════════════════════════════════════════════════
# SCORING
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/scoring/history", tags=["Scoring"])
async def get_scoring_history(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from sqlalchemy import text
    
    sql = text("""
        SELECT 
            sh.id, 
            sh.client_id, 
            c.nom_complet as client_name,
            sh.agent_id, 
            u.full_name as agent_name,
            sh.score, 
            sh.probabilite_defaut, 
            sh.decision, 
            sh.montant_recommande_gnf, 
            sh.model_version, 
            sh.created_at
        FROM score_histories sh
        LEFT JOIN clients c ON sh.client_id = c.id
        LEFT JOIN users u ON sh.agent_id = u.id
        ORDER BY sh.created_at DESC
        LIMIT :limit OFFSET :skip
    """)
    
    result = await db.execute(sql, {"limit": limit, "skip": skip})
    rows = result.mappings().all()
    return [dict(r) for r in rows]


@router.post("/scoring", tags=["Scoring"])
async def score_client(
    payload: ScoringRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    engine = get_ml_engine()

    # Récupération des données client
    if payload.client_id:
        client = await ClientService.get_by_id(db, payload.client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client introuvable")
        client_data = {
            "anciennete_mobile_mois": client.anciennete_mobile_mois,
            "nb_tx_entrees_30j": client.nb_tx_entrees_30j,
            "montant_moyen_entree_gnf": client.montant_moyen_entree_gnf,
            "regularite_remboursements": client.regularite_remboursements,
            "nb_tx_diaspora_6mois": client.nb_tx_diaspora_6mois,
            "ratio_depense_revenu": client.ratio_depense_revenu,
            "solde_moyen_gnf": client.solde_moyen_gnf,
            "sexe": client.sexe,
            "age": client.age,
            "type_activite": client.type_activite,
            "zone_geographique": client.zone_geographique,
            "nom_complet": client.nom_complet,
        }
    else:
        client_data = payload.model_dump(exclude={"client_id"})

    result = engine.score_client(client_data)

    # --- Éviter la tautologie (doublons) dans l'historique ---
    if payload.client_id:
        from datetime import datetime
        # Vérifier si un historique existe déjà pour ce client
        existing_history_query = select(ScoreHistory).where(ScoreHistory.client_id == payload.client_id)
        existing_history_res = await db.execute(existing_history_query)
        existing_history = existing_history_res.scalar_one_or_none()

        if existing_history:
            # Mise à jour de l'historique existant
            existing_history.score = result["score"]
            existing_history.probabilite_defaut = result["probabilite_defaut"]
            existing_history.decision = result["decision"]
            existing_history.montant_recommande_gnf = result["montant_recommande_gnf"]
            existing_history.shap_values = {f["feature"]: f["impact"] for f in result["top_features"]}
            existing_history.created_at = datetime.utcnow()  # Correction: valeur Python, pas expression SQL
            score_history_id = existing_history.id
        else:
            # Création d'un nouvel enregistrement si premier scoring
            history = ScoreHistory(
                client_id=payload.client_id,
                agent_id=current_user.id if current_user else None,
                score=result["score"],
                probabilite_defaut=result["probabilite_defaut"],
                decision=result["decision"],
                montant_recommande_gnf=result["montant_recommande_gnf"],
                model_version=result["model_version"],
                model_name=result["model_name"],
                input_snapshot=client_data,
                shap_values={f["feature"]: f["impact"] for f in result["top_features"]},
            )
            db.add(history)
            await db.flush()
            score_history_id = history.id
    else:
        # Cas d'un scoring ad-hoc sans client_id (pas d'historique persistant)
        score_history_id = None

    await db.commit() # <--- AJOUT CRUCIAL ICI
    result["score_history_id"] = score_history_id
    return result


@router.delete("/users/{id}", status_code=204, tags=["Users"])
async def delete_user(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul l'administrateur peut supprimer un agent")
    
    from app.models.models import User, Client
    
    
    # 1. Vérifier si l'utilisateur existe
    res = await db.execute(select(User).where(User.id == id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    # 2. Détacher l'agent de ses clients (agent_id = null)
    await db.execute(update(Client).where(Client.agent_id == id).values(agent_id=None))
    
    # 3. Détacher l'agent de l'historique des scores (agent_id = null)
    from app.models.models import ScoreHistory
    await db.execute(update(ScoreHistory).where(ScoreHistory.agent_id == id).values(agent_id=None))
    
    # 4. Supprimer l'utilisateur
    await db.delete(user)
    await db.commit()
    return None


@router.get("/settings", response_model=SystemSettingsSchema, tags=["Settings"])
async def get_settings(current_user=Depends(require_admin)):
    return SystemSettingsSchema()

# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/dashboard/stats", tags=["Dashboard"])
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from sqlalchemy import select, func
    from app.models.models import Client, ScoreHistory, User

    total_clients = await db.execute(select(func.count(Client.id)))
    total_clients = total_clients.scalar_one()

    total_users = await db.execute(select(func.count(User.id)))
    total_users = total_users.scalar_one()

    pending_count = await db.execute(select(func.count(Client.id)).where(Client.status == 'en_attente'))
    pending_count = pending_count.scalar_one()

    total_scores = await db.execute(select(func.count(ScoreHistory.id)))
    total_scores = total_scores.scalar_one()

    avg_score = await db.execute(select(func.avg(ScoreHistory.score)))
    avg_score = avg_score.scalar_one() or 0

    zone_stats = await ClientService.get_stats_by_zone(db)
    activite_stats = await ClientService.get_stats_by_activite(db)

    return {
        "total_clients": total_clients,
        "total_users": total_users,
        "pending_count": pending_count,
        "scores_total": total_scores,
        "score_moyen": round(float(avg_score), 1),
        "repartition_zones": zone_stats,
        "repartition_activites": activite_stats,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC (Client Portal)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/public/check-score", tags=["Public"])
async def check_score_public(
    telephone: str = Query(..., min_length=9),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select, desc
    from app.models.models import Client, ScoreHistory
    
    # 1. Trouver le client
    client_res = await db.execute(select(Client).where(Client.telephone == telephone))
    client = client_res.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Aucun dossier trouvé pour ce numéro")
    
    # 2. Trouver son dernier score
    score_res = await db.execute(
        select(ScoreHistory)
        .where(ScoreHistory.client_id == client.id)
        .order_by(desc(ScoreHistory.created_at))
        .limit(1)
    )
    last_score = score_res.scalar_one_or_none()
    
    if not last_score:
        return {
            "client_name": client.nom_complet,
            "has_score": False,
            "message": "Votre dossier est enregistré mais aucun score n'a été calculé."
        }
        
    return {
        "client_name": client.nom_complet,
        "has_score": True,
        "score": last_score.score,
        "decision": last_score.decision,
        "created_at": last_score.created_at,
        "interpretation": "Analyse basée sur vos transactions Mobile Money.",
        "categorie_risque": "faible" if last_score.score > 70 else "moyen" if last_score.score > 40 else "élevé"
    }
