"""Crea el tenant inicial y su usuario admin.

Sin esto la base arranca vacia y /auth/login siempre devuelve 404, porque
get_tenant resuelve el tenant por el header Host y no encuentra ninguno.

Uso desde la raiz del proyecto:
    python backend/scripts/seed.py

O dentro del contenedor:
    docker compose exec backend python scripts/seed.py

Los valores salen del .env (SEED_*) y se pueden pisar por argumento:
    python backend/scripts/seed.py --domain mitienda.com --email yo@mail.com
"""
import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from email_validator import EmailNotValidError, validate_email

# El .env vive en la raiz del proyecto. Hay que cargarlo ANTES de importar
# app.dependencies.database, que lee DATABASE_URL en tiempo de import.
_BACKEND = Path(__file__).resolve().parents[1]
load_dotenv(_BACKEND.parent / ".env")
sys.path.insert(0, str(_BACKEND))

from app.core.security import hash_password  # noqa: E402
from app.dependencies.database import SessionLocal  # noqa: E402
from app.models import AdminUser, StoreProfile, Tenant  # noqa: E402


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Crea el tenant y admin iniciales.")
    p.add_argument("--domain", default=os.getenv("SEED_TENANT_DOMAIN", "localhost"))
    p.add_argument("--name", default=os.getenv("SEED_TENANT_NAME", "Tienda Demo"))
    p.add_argument("--email", default=os.getenv("SEED_ADMIN_EMAIL", "admin@mystoreexe.com"))
    p.add_argument("--password", default=os.getenv("SEED_ADMIN_PASSWORD", "admin1234"))
    return p.parse_args()


def main() -> None:
    args = parse_args()

    # El login valida el email con EmailStr. Si sembramos uno que no pasa esa
    # validacion (p.ej. "admin@localhost", sin punto en el dominio) el usuario
    # queda creado pero no puede entrar nunca: el login devuelve 422.
    try:
        validate_email(args.email, check_deliverability=False)
    except EmailNotValidError as exc:
        raise SystemExit(f"Email invalido ({args.email}): {exc}")

    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter(Tenant.domain == args.domain).first()
        if tenant:
            print(f"= tenant ya existe: {args.domain} (id={tenant.id})")
        else:
            tenant = Tenant(domain=args.domain, name=args.name)
            db.add(tenant)
            db.flush()
            print(f"+ tenant creado: {args.domain} (id={tenant.id})")

        user = (
            db.query(AdminUser)
            .filter(AdminUser.tenant_id == tenant.id, AdminUser.email == args.email)
            .first()
        )
        if user:
            print(f"= admin ya existe: {args.email}")
        else:
            db.add(
                AdminUser(
                    tenant_id=tenant.id,
                    email=args.email,
                    hashed_password=hash_password(args.password),
                )
            )
            print(f"+ admin creado: {args.email} / {args.password}")

        profile = db.query(StoreProfile).filter(StoreProfile.tenant_id == tenant.id).first()
        if profile:
            print(f"= perfil ya existe: {profile.business_name}")
        else:
            db.add(
                StoreProfile(
                    tenant_id=tenant.id,
                    business_name=args.name,
                    description="Perfil inicial generado por el seed.",
                )
            )
            print(f"+ perfil creado: {args.name}")

        db.commit()
        print(f"\nListo. Entra al panel con {args.email} en http://{args.domain}:5173")
    finally:
        db.close()


if __name__ == "__main__":
    main()
