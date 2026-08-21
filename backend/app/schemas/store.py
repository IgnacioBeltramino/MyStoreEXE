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
    whatsapp: str | None

    model_config = {"from_attributes": True}


class StoreCategoryPublic(BaseModel):
    id: int
    name: str
    description: str | None
    sort_order: int

    model_config = {"from_attributes": True}


class StoreImagePublic(BaseModel):
    url: str
    alt: str | None

    model_config = {"from_attributes": True}


class StoreAttributePublic(BaseModel):
    label: str
    value: str


class StoreProductPublic(BaseModel):
    id: int
    category_id: int | None
    name: str
    description: str | None
    price: Decimal
    sort_order: int
    # La ficha tecnica y la galeria, en el orden en que se cargaron. La portada
    # es images[0]; si la lista viene vacia, el front pone un placeholder.
    attributes: list[StoreAttributePublic]
    images: list[StoreImagePublic]

    model_config = {"from_attributes": True}
