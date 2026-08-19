from sqlalchemy.orm import Session

from app.models.store_profile import StoreProfile


def get_by_tenant(db: Session, tenant_id: int) -> StoreProfile | None:
    return db.query(StoreProfile).filter(StoreProfile.tenant_id == tenant_id).first()


def create(db: Session, tenant_id: int, data: dict) -> StoreProfile:
    profile = StoreProfile(tenant_id=tenant_id, **data)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update(db: Session, profile: StoreProfile, data: dict) -> StoreProfile:
    for key, value in data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile
