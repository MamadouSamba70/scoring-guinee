from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List, Optional
from functools import lru_cache


class Settings(BaseSettings):
    # ─── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "Moteur de Scoring Crédit Guinée"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # ─── Base de données ──────────────────────────────────────────────────────
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "scoring_guinee"
    POSTGRES_USER: str = "scoring_user"
    POSTGRES_PASSWORD: str = "scoring_secret"
    DATABASE_URL: str = "postgresql+asyncpg://scoring_user:scoring_secret@db:5432/scoring_guinee"

    # ─── Redis ────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://:redis_secret@redis:6379/0"
    REDIS_HOST: Optional[str] = None
    REDIS_PORT: Optional[int] = None
    REDIS_PASSWORD: Optional[str] = None

    # ─── JWT ──────────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # ─── ML ───────────────────────────────────────────────────────────────────
    ML_MODELS_PATH: str = "/app/ml_models"
    MLFLOW_TRACKING_URI: str = "sqlite:///ml_models/mlflow.db"

    # ─── PDF ──────────────────────────────────────────────────────────────────
    PDF_OUTPUT_PATH: str = "/tmp/reports"

    # ─── Rate Limiting ────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    model_config = {"env_file": ".env", "case_sensitive": True, "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
