from sqlalchemy.orm import Session, selectinload

from app.models.product import Product
from app.models.product_image import ProductImage


def _con_imagenes(db: Session, tenant_id: int):
    # selectinload evita el N+1: sin esto, listar 50 productos dispara 50
    # consultas mas, una por galeria.
    return (
        db.query(Product)
        .options(selectinload(Product.images))
        .filter(Product.tenant_id == tenant_id)
    )


def get_all(
    db: Session,
    tenant_id: int,
    category_id: int | None = None,
    include_inactive: bool = False,
) -> list[Product]:
    q = _con_imagenes(db, tenant_id)
    if category_id is not None:
        q = q.filter(Product.category_id == category_id)
    if not include_inactive:
        q = q.filter(Product.is_active.is_(True))
    return q.order_by(Product.sort_order, Product.id).all()


def get_by_id(db: Session, tenant_id: int, product_id: int) -> Product | None:
    return _con_imagenes(db, tenant_id).filter(Product.id == product_id).first()


def _armar_imagenes(imagenes: list[dict]) -> list[ProductImage]:
    """El orden del array es el orden en que se muestran; la primera es la portada."""
    return [
        ProductImage(url=img["url"], alt=img.get("alt"), sort_order=i)
        for i, img in enumerate(imagenes)
    ]


def create(db: Session, tenant_id: int, data: dict) -> Product:
    imagenes = data.pop("images", None) or []
    product = Product(tenant_id=tenant_id, **data)
    product.images = _armar_imagenes(imagenes)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update(db: Session, product: Product, data: dict) -> Product:
    # Solo se tocan las fotos si vinieron en el body: editar el precio no tiene
    # por que borrar la galeria.
    if "images" in data:
        # delete-orphan borra las que ya no estan en la lista nueva.
        product.images = _armar_imagenes(data.pop("images") or [])
    for key, value in data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete(db: Session, product: Product) -> None:
    """Baja logica: se marca inactivo para conservar el historial."""
    product.is_active = False
    db.commit()
