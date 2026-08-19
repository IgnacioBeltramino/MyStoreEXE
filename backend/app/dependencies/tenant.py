from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.models.tenant import Tenant


def get_tenant(host: str = Header(...), db: Session = Depends(get_db)) -> Tenant:
    domain = host.split(":")[0].lower()
    tenant = (
        db.query(Tenant)
        .filter(Tenant.domain == domain, Tenant.is_active.is_(True))
        .first()
    )
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant no encontrado")
    return tenant
