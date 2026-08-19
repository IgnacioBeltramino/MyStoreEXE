from sqlalchemy.orm import Session

from app.models.product import Product


def get_all(
    db: Session,
    tenant_id: int,
    category_id: int | None = None,
    include_inactive: bool = False,
) -> list[Product]:
    q = db.query(Product).filter(Product.tenant_id == tenant_id)
    if category_id is not None:
        q = q.filter(Product.category_id == category_id)
    if not include_inactive:
        q = q.filter(Product.is_active.is_(True))
    return q.order_by(Product.sort_order, Product.id).all()


def get_by_id(db: Session, tenant_id: int, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.tenant_id == tenant_id, Product.id == product_id).first()


def create(db: Session, tenant_id: int, data: dict) -> Product:
    product = Product(tenant_id=tenant_id, **data)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update(db: Session, product: Product, data: dict) -> Product:
    for key, value in data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete(db: Session, product: Product) -> None:
    """Baja logica: se marca inactivo para conservar el historial."""
    product.is_active = False
    db.commit()
