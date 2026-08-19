from decimal import Decimal

from pydantic import BaseModel


# --- StoreProfile ---

class StoreProfileUpdate(BaseModel):
    business_name: str
    description: str | None = None
    phone: str | None = None
    address: str | None = None
    logo_url: str | None = None


class StoreProfileResponse(BaseModel):
    id: int
    tenant_id: int
    business_name: str
    description: str | None
    phone: str | None
    address: str | None
    logo_url: str | None

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


# --- Product ---

class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    category_id: int | None = None
    image_url: str | None = None
    sort_order: int = 0


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    category_id: int | None = None
    image_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: int
    tenant_id: int
    category_id: int | None
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    sort_order: int
    is_active: bool

    model_config = {"from_attributes": True}
