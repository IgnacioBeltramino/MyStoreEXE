from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utcnow


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    admin_users: Mapped[list["AdminUser"]] = relationship("AdminUser", back_populates="tenant")
    store_profile: Mapped["StoreProfile | None"] = relationship("StoreProfile", back_populates="tenant", uselist=False)
    categories: Mapped[list["Category"]] = relationship("Category", back_populates="tenant")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="tenant")

    def __repr__(self) -> str:
        return f"<Tenant id={self.id} domain={self.domain!r}>"
