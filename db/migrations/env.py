import os
import sys
from logging.config import fileConfig
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from alembic import context

# Cargar .env desde la raiz del proyecto (dos niveles arriba de db/migrations)
_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_ROOT / ".env")

# Agregar backend/ al sys.path para que Alembic encuentre los modelos
_BACKEND = _ROOT / "backend"
sys.path.insert(0, str(_BACKEND))

# Importar modelos para autogenerate
from app.models import Base, Tenant, AdminUser  # noqa: F401, E402

# Configuracion Alembic
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Sobreescribir sqlalchemy.url con DATABASE_URL del entorno
_db_url = os.environ.get("DATABASE_URL")
if _db_url:
    config.set_main_option("sqlalchemy.url", _db_url)


def run_migrations_offline() -> None:
    """Modo offline: genera SQL sin conectarse a la base."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Modo online: se conecta a la base y aplica las migraciones."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
