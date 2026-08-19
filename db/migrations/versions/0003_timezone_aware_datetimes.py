"""timezone_aware_datetimes

Pasa las columnas de fecha de TIMESTAMP (naive) a TIMESTAMPTZ.

Los valores viejos se habian guardado con datetime.utcnow(), o sea UTC pero
sin zona. Por eso la conversion usa "AT TIME ZONE 'UTC'": sin eso Postgres
asumiria la zona del servidor y correria las fechas.

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLUMNS = [
    ("tenants", "created_at"),
    ("admin_users", "created_at"),
    ("store_profiles", "updated_at"),
    ("categories", "created_at"),
    ("products", "created_at"),
]


def upgrade() -> None:
    for table, column in _COLUMNS:
        op.alter_column(
            table,
            column,
            existing_type=sa.DateTime(),
            type_=sa.DateTime(timezone=True),
            existing_nullable=False,
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
        )


def downgrade() -> None:
    for table, column in _COLUMNS:
        op.alter_column(
            table,
            column,
            existing_type=sa.DateTime(timezone=True),
            type_=sa.DateTime(),
            existing_nullable=False,
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
        )
