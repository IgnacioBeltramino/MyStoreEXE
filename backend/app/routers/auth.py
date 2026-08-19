from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import verify_password, create_access_token
from app.dependencies.database import get_db
from app.dependencies.tenant import get_tenant
from app.models.admin_user import AdminUser
from app.models.tenant import Tenant
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_tenant),
) -> TokenResponse:
    user = (
        db.query(AdminUser)
        .filter(
            AdminUser.email == data.email,
            AdminUser.tenant_id == tenant.id,
            AdminUser.is_active.is_(True),
        )
        .first()
    )
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    return TokenResponse(access_token=create_access_token(user.id))
