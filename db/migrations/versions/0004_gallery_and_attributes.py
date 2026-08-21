"""gallery_and_attributes

Tres cambios, todos genericos (sirven para autos, ropa o lo que sea):

1. store_profiles.whatsapp: el numero para el boton de consulta de la tienda.
2. products.attributes: la ficha tecnica, una lista de pares etiqueta/valor.
   Un auto lleva "Año: 2019", una remera "Talle: M". La plataforma no sabe
   de que rubro es.
3. product_images: varias fotos por producto, ordenadas. Reemplaza a la
   columna products.image_url, que solo permitia una.

Sobre el punto 3: la portada pasa a ser la primera foto por sort_order, en vez
de una columna aparte. Con portada y galeria separadas alcanza con borrar la
foto de la galeria para que la portada quede apuntando a algo que ya no esta.
Los valores que habia en image_url se copian a la tabla nueva antes de borrar
la columna, y el downgrade los devuelve.

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("store_profiles", sa.Column("whatsapp", sa.String(length=50), nullable=True))

    op.add_column(
        "products",
        sa.Column("attributes", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )

    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("alt", sa.String(length=255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"], unique=False)

    # Las fotos que ya estaban cargadas pasan a ser la primera de la galeria.
    op.execute(
        """
        INSERT INTO product_images (product_id, url, sort_order, created_at)
        SELECT id, image_url, 0, now()
        FROM products
        WHERE image_url IS NOT NULL AND image_url <> ''
        """
    )

    op.drop_column("products", "image_url")


def downgrade() -> None:
    op.add_column("products", sa.Column("image_url", sa.String(length=500), nullable=True))

    # Vuelve la primera foto de cada producto a la columna vieja. Las demas se
    # pierden: la columna solo admite una, es el precio de volver atras.
    op.execute(
        """
        UPDATE products p
        SET image_url = sub.url
        FROM (
            SELECT DISTINCT ON (product_id) product_id, url
            FROM product_images
            ORDER BY product_id, sort_order, id
        ) AS sub
        WHERE sub.product_id = p.id
        """
    )

    op.drop_index("ix_product_images_product_id", table_name="product_images")
    op.drop_table("product_images")
    op.drop_column("products", "attributes")
    op.drop_column("store_profiles", "whatsapp")
