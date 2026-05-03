-- Initialisation de la base de données scoring_guinee
-- Ce script s'exécute au premier démarrage du conteneur PostgreSQL

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- recherche textuelle floue

-- Index de recherche sur les noms clients (sera utilisé après création des tables)
-- Les index sur les colonnes sont créés dans les modèles SQLAlchemy

-- Données initiales : compte administrateur créé via l'API au premier lancement
-- voir /scripts/seed_admin.py
