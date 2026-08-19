"""Fixtures compartidas. Los tests corren contra SQLite en memoria: no hace
falta levantar Postgres ni Docker para validar la logica de la API."""
import os
import sys
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_password
from app.dependencies.database import get_db
from app.main import app
from app.models import AdminUser, Base, Tenant

TENANTS = [
    ("tienda-a.test", "admin@tienda-a.com"),
    ("tienda-b.test", "admin@tienda-b.com"),
]
PASSWORD = "secreto123"


@pytest.fixture
def session_factory():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    db = factory()
    for domain, email in TENANTS:
        tenant = Tenant(domain=domain, name=domain)
        db.add(tenant)
        db.flush()
        db.add(AdminUser(tenant_id=tenant.id, email=email, hashed_password=hash_password(PASSWORD)))
    db.commit()
    db.close()

    yield factory
    Base.metadata.drop_all(engine)


@pytest.fixture
def client(session_factory):
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def headers(client):
    """headers("tienda-a.test") -> Host + Bearer del admin de esa tienda."""
    tokens: dict[str, str] = {}

    def _headers(domain: str, authenticated: bool = True) -> dict[str, str]:
        h = {"Host": domain}
        if not authenticated:
            return h
        if domain not in tokens:
            email = next(e for d, e in TENANTS if d == domain)
            r = client.post("/auth/login", json={"email": email, "password": PASSWORD}, headers={"Host": domain})
            tokens[domain] = r.json()["access_token"]
        h["Authorization"] = f"Bearer {tokens[domain]}"
        return h

    return _headers
