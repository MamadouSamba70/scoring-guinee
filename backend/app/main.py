from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys
from datetime import datetime

from app.core.config import settings
from app.api.v1.endpoints.routes import router
from app.db.session import engine, Base

# ─── Logging structuré ────────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | {message}",
    level="DEBUG" if settings.DEBUG else "INFO",
)


# ─── Lifecycle : init DB + modèle ML au démarrage ─────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== Démarrage du Moteur de Scoring Guinée ===")

    # Création des tables si elles n'existent pas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Base de données initialisée")

    # Pré-chargement du modèle ML
    from app.ml.engine import get_ml_engine
    get_ml_engine()
    logger.info("Modèle ML chargé")

    yield

    logger.info("=== Arrêt de l'application ===")
    await engine.dispose()


# ─── App principale ───────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    **Moteur de Scoring de Crédit Alternatif** pour les micro-entrepreneurs guinéens.

    Utilise des données mobile money (Orange Money, MTN) comme variables prédictives
    à la place d'un historique bancaire traditionnel inexistant.

    ## Fonctionnalités
    - Scoring ML (Gradient Boosting) avec explication SHAP
    - Gestion des clients micro-entrepreneurs
    - Dashboard analytique
    - Export PDF des rapports de score
    - Auth JWT avec rôles (admin / agent / viewer)
    """,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ─── Middlewares ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        with open("debug_errors.log", "a", encoding="utf-8") as f:
            f.write(f"\n\n--- ERROR AT {datetime.now()} ---\n")
            f.write(f"URL: {request.url}\n")
            f.write(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "trace": str(exc)}
        )

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(router, prefix="/api/v1")


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
