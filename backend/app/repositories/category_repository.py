from sqlalchemy.orm import Session

from app.models.category import Category


def get_all(db: Session, tenant_id: int) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.tenant_id == tenant_id)
        .order_by(Category.sort_order, Category.id)
        .all()
    )


def get_by_id(db: Session, tenant_id: int, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.tenant_id == tenant_id, Category.id == category_id).first()


def create(db: Session, tenant_id: int, data: dict) -> Category:
    category = Category(tenant_id=tenant_id, **data)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update(db: Session, category: Category, data: dict) -> Category:
    for key, value in data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


def delete(db: Session, category: Category) -> None:
    category.is_active = False
    db.commit()
