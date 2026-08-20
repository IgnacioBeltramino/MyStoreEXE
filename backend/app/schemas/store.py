"""Schemas de la tienda publica.

Son distintos a los de admin a proposito: no exponen `tenant_id` ni `is_active`.
El cliente que navega la tienda no tiene por que enterarse de como esta
organizada la multi-tenancy por dentro.
"""
from decimal import Decimal

from pydantic import BaseModel


class StoreProfilePublic(BaseModel):
    business_name: str
    description: str | None
    phone: str | None
    address: str | None
    logo_url: str | None

    model_config = {"from_attributes": True}


class StoreCategoryPublic(BaseModel):
    id: int
    name: str
    description: str | None
    sort_order: int

    model_config = {"from_attributes": True}


class StoreProductPublic(BaseModel):
    id: int
    category_id: int | None
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    sort_order: int

    model_config = {"from_attributes": True}
