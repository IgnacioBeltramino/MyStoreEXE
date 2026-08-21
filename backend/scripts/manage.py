"""Gestion de la plataforma: las tiendas y sus cuentas de admin.

Esto es para VOS, el dueno de MyStoreEXE. Lo que cada cliente hace con su
catalogo va por su panel; aca se da de alta la tienda y su usuario.

Uso dentro del contenedor (la base es "db", no "localhost"):

    docker compose exec backend python scripts/manage.py tiendas
    docker compose exec backend python scripts/manage.py crear-tienda --domain tienda1.com --name "Tienda Uno" --email dueno@tienda1.com
    docker compose exec backend python scripts/manage.py crear-admin  --domain tienda1.com --email otro@tienda1.com
    docker compose exec backend python scripts/manage.py password     --domain tienda1.com --email dueno@tienda1.com
    docker compose exec backend python scripts/manage.py baja-tienda  --domain tienda1.com
    docker compose exec backend python scripts/manage.py alta-tienda  --domain tienda1.com

Si no pasas --password se genera una y se imprime una sola vez.
"""
import argparse
import secrets
import sys
from pathlib import Path

from dotenv import load_dotenv
from email_validator import EmailNotValidError, validate_email

# El .env vive en la raiz del proyecto. Hay que cargarlo ANTES de importar
# app.dependencies.database, que lee DATABASE_URL en tiempo de import.
_BACKEND = Path(__file__).resolve().parents[1]
load_dotenv(_BACKEND.parent / ".env")
sys.path.insert(0, str(_BACKEND))

from sqlalchemy.orm import Session  # noqa: E402

from app.core.security import hash_password  # noqa: E402
from app.dependencies.database import SessionLocal  # noqa: E402
from app.models import AdminUser, Product, StoreProfile, Tenant  # noqa: E402


# --- Helpers ---

def normalizar_dominio(raw: str) -> str:
    """Deja el dominio como lo va a ver el backend.

    get_tenant compara contra el header Host ya recortado: sin esquema, sin
    puerto y en minusculas. Si se guarda "https://Tienda1.com/" el tenant no
    se encuentra nunca y todo responde 404 sin que se entienda por que.
    """
    d = raw.strip().lower()
    for prefijo in ("https://", "http://"):
        if d.startswith(prefijo):
            d = d[len(prefijo):]
    d = d.split("/")[0].split(":")[0]
    if not d:
        raise SystemExit(f"Dominio invalido: {raw!r}")
    return d


def validar_email(email: str) -> str:
    """El login valida con EmailStr, que exige un dominio con punto.

    Si se crea un usuario con un email que no pasa esa validacion, queda en la
    base pero no puede entrar nunca: /auth/login devuelve 422.
    """
    try:
        validate_email(email, check_deliverability=False)
    except EmailNotValidError as exc:
        raise SystemExit(f"Email invalido ({email}): {exc}")
    return email


def generar_password() -> str:
    return secrets.token_urlsafe(9)


def buscar_tenant(db: Session, domain: str) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.domain == domain).first()
    if not tenant:
        raise SystemExit(
            f"No existe ninguna tienda con el dominio {domain}. Miralas con: manage.py tiendas"
        )
    return tenant


def crear_admin(db: Session, tenant: Tenant, email: str, password: str | None) -> str | None:
    """Devuelve la password si creo el usuario, None si ya existia."""
    ya_esta = (
        db.query(AdminUser)
        .filter(AdminUser.tenant_id == tenant.id, AdminUser.email == email)
        .first()
    )
    if ya_esta:
        print(f"= el admin {email} ya existe en {tenant.domain}")
        return None
    password = password or generar_password()
    db.add(AdminUser(tenant_id=tenant.id, email=email, hashed_password=hash_password(password)))
    print(f"+ admin creado: {email}")
    return password


def imprimir_password(password: str | None) -> None:
    if password:
        print(f"Password: {password}   <- anotala, no se vuelve a mostrar")


# --- Comandos ---

def cmd_tiendas(args: argparse.Namespace, db: Session) -> None:
    tenants = db.query(Tenant).order_by(Tenant.id).all()
    if not tenants:
        print("No hay ninguna tienda todavia.")
        print("Crea una con: manage.py crear-tienda --domain ... --name ...")
        return

    encabezados = ("ID", "DOMINIO", "NOMBRE", "ESTADO", "ADMINS", "PRODUCTOS")
    filas = []
    for t in tenants:
        admins = db.query(AdminUser).filter(AdminUser.tenant_id == t.id).count()
        productos = (
            db.query(Product)
            .filter(Product.tenant_id == t.id, Product.is_active.is_(True))
            .count()
        )
        filas.append(
            (
                str(t.id),
                t.domain,
                t.name,
                "activa" if t.is_active else "DE BAJA",
                str(admins),
                str(productos),
            )
        )

    anchos = [max(len(fila[i]) for fila in (*filas, encabezados)) for i in range(len(encabezados))]

    def formatear(fila: tuple[str, ...]) -> str:
        return "  ".join(valor.ljust(anchos[i]) for i, valor in enumerate(fila)).rstrip()

    print(formatear(encabezados))
    print("  ".join("-" * ancho for ancho in anchos))
    for fila in filas:
        print(formatear(fila))


def cmd_crear_tienda(args: argparse.Namespace, db: Session) -> None:
    domain = normalizar_dominio(args.domain)
    if db.query(Tenant).filter(Tenant.domain == domain).first():
        raise SystemExit(f"Ya existe una tienda con el dominio {domain}.")

    tenant = Tenant(domain=domain, name=args.name)
    db.add(tenant)
    db.flush()
    print(f"+ tienda creada: {args.name} ({domain})")

    db.add(
        StoreProfile(
            tenant_id=tenant.id,
            business_name=args.name,
            description="Perfil inicial. Editalo desde el panel.",
        )
    )
    print("+ perfil inicial creado")

    password = None
    if args.email:
        password = crear_admin(db, tenant, validar_email(args.email), args.password)

    db.commit()

    print(f"\nListo en la base. Falta que {domain} apunte al servidor (DNS + nginx).")
    if args.email:
        print(f"El admin entra en https://{domain}/admin con {args.email}")
        imprimir_password(password)


def cmd_crear_admin(args: argparse.Namespace, db: Session) -> None:
    tenant = buscar_tenant(db, normalizar_dominio(args.domain))
    password = crear_admin(db, tenant, validar_email(args.email), args.password)
    db.commit()
    imprimir_password(password)


def cmd_password(args: argparse.Namespace, db: Session) -> None:
    tenant = buscar_tenant(db, normalizar_dominio(args.domain))
    user = (
        db.query(AdminUser)
        .filter(AdminUser.tenant_id == tenant.id, AdminUser.email == args.email)
        .first()
    )
    if not user:
        raise SystemExit(f"No existe el admin {args.email} en {tenant.domain}.")

    password = args.password or generar_password()
    user.hashed_password = hash_password(password)
    db.commit()
    print(f"Password de {args.email} cambiada.")
    imprimir_password(password)


def cmd_baja_tienda(args: argparse.Namespace, db: Session) -> None:
    tenant = buscar_tenant(db, normalizar_dominio(args.domain))
    if not tenant.is_active:
        print(f"= la tienda {tenant.domain} ya estaba de baja")
        return
    # Baja logica, igual que productos y categorias: los datos quedan en la
    # base y se puede reactivar con alta-tienda.
    tenant.is_active = False
    db.commit()
    print(f"- tienda dada de baja: {tenant.domain}")
    print("El panel y la tienda publica pasan a responder 404. Los datos siguen en la base.")


def cmd_alta_tienda(args: argparse.Namespace, db: Session) -> None:
    tenant = buscar_tenant(db, normalizar_dominio(args.domain))
    if tenant.is_active:
        print(f"= la tienda {tenant.domain} ya estaba activa")
        return
    tenant.is_active = True
    db.commit()
    print(f"+ tienda reactivada: {tenant.domain}")


# --- CLI ---

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="manage.py",
        description="Gestion de tiendas y cuentas de admin de MyStoreEXE.",
    )
    sub = p.add_subparsers(dest="comando", required=True)

    s = sub.add_parser("tiendas", help="Lista todas las tiendas")
    s.set_defaults(func=cmd_tiendas)

    s = sub.add_parser("crear-tienda", help="Da de alta una tienda y, si queres, su admin")
    s.add_argument("--domain", required=True, help="Dominio, por ejemplo tienda1.com")
    s.add_argument("--name", required=True, help="Nombre del negocio")
    s.add_argument("--email", help="Email del admin. Si lo omitis, la tienda queda sin usuario")
    s.add_argument("--password", help="Si no la pasas, se genera una")
    s.set_defaults(func=cmd_crear_tienda)

    s = sub.add_parser("crear-admin", help="Agrega un admin a una tienda existente")
    s.add_argument("--domain", required=True)
    s.add_argument("--email", required=True)
    s.add_argument("--password", help="Si no la pasas, se genera una")
    s.set_defaults(func=cmd_crear_admin)

    s = sub.add_parser("password", help="Cambia la password de un admin")
    s.add_argument("--domain", required=True)
    s.add_argument("--email", required=True)
    s.add_argument("--password", help="Si no la pasas, se genera una")
    s.set_defaults(func=cmd_password)

    s = sub.add_parser("baja-tienda", help="Da de baja una tienda (baja logica)")
    s.add_argument("--domain", required=True)
    s.set_defaults(func=cmd_baja_tienda)

    s = sub.add_parser("alta-tienda", help="Reactiva una tienda dada de baja")
    s.add_argument("--domain", required=True)
    s.set_defaults(func=cmd_alta_tienda)

    return p


def main() -> None:
    args = build_parser().parse_args()
    db = SessionLocal()
    try:
        args.func(args, db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
