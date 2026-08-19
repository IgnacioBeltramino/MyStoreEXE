from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.models.store_profile import StoreProfile


def get_summary(db: Session, tenant_id: int) -> dict:
    """Contadores del dashboard, en una sola pasada por tabla.

    Solo cuenta lo activo: es lo que el dueno de la tienda ve publicado.
    """
    active_products = db.scalar(
        select(func.count(Product.id)).where(
            Product.tenant_id == tenant_id, Product.is_active.is_(True)
        )
    )
    active_categories = db.scalar(
        select(func.count(Category.id)).where(
            Category.tenant_id == tenant_id, Category.is_active.is_(True)
        )
    )
    uncategorized = db.scalar(
        select(func.count(Product.id)).where(
            Product.tenant_id == tenant_id,
            Product.is_active.is_(True),
            Product.category_id.is_(None),
        )
    )
    profile = db.scalar(select(StoreProfile).where(StoreProfile.tenant_id == tenant_id))

    return {
        "active_products": active_products or 0,
        "active_categories": active_categories or 0,
        "uncategorized_products": uncategorized or 0,
        "profile_complete": bool(profile and profile.business_name and profile.description),
        "store_name": profile.business_name if profile else None,
    }
