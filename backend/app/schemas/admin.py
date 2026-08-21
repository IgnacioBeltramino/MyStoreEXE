from decimal import Decimal

from pydantic import BaseModel, Field


# --- StoreProfile ---

class StoreProfileUpdate(BaseModel):
    business_name: str
    description: str | None = None
    phone: str | None = None
    address: str | None = None
    logo_url: str | None = None
    whatsapp: str | None = None


class StoreProfileResponse(BaseModel):
    id: int
    tenant_id: int
    business_name: str
    description: str | None
    phone: str | None
    address: str | None
    logo_url: str | None
    whatsapp: str | None

    model_config = {"from_attributes": True}


# --- Category ---

class CategoryCreate(BaseModel):
    name: str
    description: str | None = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: int
    tenant_id: int
    name: str
    description: str | None
    sort_order: int
    is_active: bool

    model_config = {"from_attributes": True}


# --- Producto: ficha tecnica y fotos ---

class AttributeInput(BaseModel):
    """Una fila de la ficha tecnica. "Año" / "2019", "Talle" / "M"."""

    label: str = Field(min_length=1, max_length=40)
    value: str = Field(min_length=1, max_length=120)


class ProductImageInput(BaseModel):
    url: str = Field(min_length=1, max_length=500)
    alt: str | None = Field(default=None, max_length=255)


class ProductImageResponse(BaseModel):
    id: int
    url: str
    alt: str | None
    sort_order: int

    model_config = {"from_attributes": True}


# --- Product ---

# La ficha y la galeria se mandan enteras en cada alta o edicion, no de a una.
# Con pocas filas por producto es mas simple de todos lados: el front manda la
# lista como quedo y el backend la reemplaza, sin endpoints aparte para agregar
# o borrar una foto suelta. El orden del array es el orden en que se muestran.

class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    category_id: int | None = None
    sort_order: int = 0
    attributes: list[AttributeInput] = Field(default_factory=list, max_length=20)
    images: list[ProductImageInput] = Field(default_factory=list, max_length=12)


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    category_id: int | None = None
    sort_order: int | None = None
    is_active: bool | None = None
    attributes: list[AttributeInput] | None = Field(default=None, max_length=20)
    images: list[ProductImageInput] | None = Field(default=None, max_length=12)


class ProductResponse(BaseModel):
    id: int
    tenant_id: int
    category_id: int | None
    name: str
    description: str | None
    price: Decimal
    sort_order: int
    is_active: bool
    attributes: list[AttributeInput]
    images: list[ProductImageResponse]

    model_config = {"from_attributes": True}


# --- Dashboard ---

class StatsResponse(BaseModel):
    active_products: int
    active_categories: int
    uncategorized_products: int
    profile_complete: bool
    store_name: str | None
