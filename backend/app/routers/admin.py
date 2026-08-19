from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.dependencies.tenant import get_tenant
from app.models.admin_user import AdminUser
from app.models.tenant import Tenant
from app.repositories import store_profile_repository, category_repository, product_repository, stats_repository
from app.schemas.admin import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    StoreProfileUpdate, StoreProfileResponse,
    StatsResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _assert_category_belongs_to_tenant(db: Session, tenant_id: int, category_id: int | None) -> None:
    """Evita que un producto se cuelgue de una categoria de otro tenant.

    Sin este chequeo alcanza con mandar un category_id ajeno en el body para
    cruzar datos entre tiendas, aunque el producto se cree en el tenant correcto.
    """
    if category_id is None:
        return
    if not category_repository.get_by_id(db, tenant_id, category_id):
        raise HTTPException(
            status_code=422,  # UNPROCESSABLE_ENTITY: la constante cambio de nombre entre versiones de Starlette
            detail="La categoria no existe en esta tienda",
        )


# --- Perfil ---

@router.get("/profile", response_model=StoreProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> StoreProfileResponse:
    profile = store_profile_repository.get_by_tenant(db, tenant.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no configurado")
    return profile


@router.put("/profile", response_model=StoreProfileResponse)
def upsert_profile(
    data: StoreProfileUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> StoreProfileResponse:
    profile = store_profile_repository.get_by_tenant(db, tenant.id)
    if profile:
        return store_profile_repository.update(db, profile, data.model_dump(exclude_unset=True))
    return store_profile_repository.create(db, tenant.id, data.model_dump())


# --- Categorias ---

@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> list[CategoryResponse]:
    return category_repository.get_all(db, tenant.id, include_inactive)


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> CategoryResponse:
    return category_repository.create(db, tenant.id, data.model_dump())


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> CategoryResponse:
    category = category_repository.get_by_id(db, tenant.id, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria no encontrada")
    return category_repository.update(db, category, data.model_dump(exclude_unset=True))


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> None:
    category = category_repository.get_by_id(db, tenant.id, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria no encontrada")
    category_repository.delete(db, category)


# --- Productos ---

@router.get("/products", response_model=list[ProductResponse])
def list_products(
    category_id: int | None = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> list[ProductResponse]:
    return product_repository.get_all(db, tenant.id, category_id, include_inactive)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> ProductResponse:
    _assert_category_belongs_to_tenant(db, tenant.id, data.category_id)
    return product_repository.create(db, tenant.id, data.model_dump())


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> ProductResponse:
    product = product_repository.get_by_id(db, tenant.id, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    changes = data.model_dump(exclude_unset=True)
    if "category_id" in changes:
        _assert_category_belongs_to_tenant(db, tenant.id, changes["category_id"])
    return product_repository.update(db, product, changes)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> None:
    product = product_repository.get_by_id(db, tenant.id, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    product_repository.delete(db, product)


# --- Dashboard ---

@router.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
    _: AdminUser = Depends(get_current_user),
) -> StatsResponse:
    return StatsResponse(**stats_repository.get_summary(db, tenant.id))
