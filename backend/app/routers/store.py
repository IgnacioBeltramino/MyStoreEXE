"""Endpoints publicos: lo que consume el front de la tienda, sin login.

El tenant se sigue resolviendo por el header `Host`, igual que en /admin. La
diferencia es que aca no hay `get_current_user`: cualquiera que entre al
dominio de la tienda ve el catalogo. Por eso nunca se devuelve nada inactivo.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.tenant import get_tenant
from app.models.tenant import Tenant
from app.repositories import category_repository, product_repository, store_profile_repository
from app.schemas.store import StoreCategoryPublic, StoreProductPublic, StoreProfilePublic

router = APIRouter(prefix="/store", tags=["store"])


@router.get("/profile", response_model=StoreProfilePublic)
def get_profile(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
) -> StoreProfilePublic:
    profile = store_profile_repository.get_by_tenant(db, tenant.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tienda no configurada")
    return profile


@router.get("/categories", response_model=list[StoreCategoryPublic])
def list_categories(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
) -> list[StoreCategoryPublic]:
    return category_repository.get_all(db, tenant.id)


@router.get("/products", response_model=list[StoreProductPublic])
def list_products(
    category_id: int | None = None,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
) -> list[StoreProductPublic]:
    if category_id is not None:
        # Si la categoria no existe, es de otra tienda o esta dada de baja, no
        # se listan sus productos: para el visitante esa categoria no existe.
        category = category_repository.get_by_id(db, tenant.id, category_id)
        if not category or not category.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria no encontrada")
    return product_repository.get_all(db, tenant.id, category_id)
