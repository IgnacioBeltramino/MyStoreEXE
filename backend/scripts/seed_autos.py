"""Carga una concesionaria de ejemplo para probar la tienda publica.

Es solo para desarrollo: sirve para tener datos con los que mirar la landing
sin cargar todo a mano. No corre en produccion.

    docker compose exec backend python scripts/seed_autos.py --domain autos.localhost

La tienda tiene que existir. Si no, creala antes:

    docker compose exec backend python scripts/manage.py crear-tienda \
        --domain autos.localhost --name "Automotores del Sur" --email vendedor@autos.com

Las fotos apuntan a picsum.photos: son placeholders, no autos. Estan para ver
como se arma la grilla y como quedan las tarjetas con imagen real, no para
mostrarle a nadie.
"""
import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

_BACKEND = Path(__file__).resolve().parents[1]
load_dotenv(_BACKEND.parent / ".env")
sys.path.insert(0, str(_BACKEND))

from app.dependencies.database import SessionLocal  # noqa: E402
from app.models import Category, Product, ProductImage, StoreProfile, Tenant  # noqa: E402

PERFIL = {
    "business_name": "Automotores del Sur",
    "description": "Usados seleccionados y 0km. Financiacion propia y toma de tu usado.",
    "phone": "+54 11 4444-5555",
    "address": "Av. Rivadavia 8800, CABA",
    "whatsapp": "5491144445555",
}

CATEGORIAS = [
    {"name": "0km", "description": "Unidades nuevas, con garantia de fabrica.", "sort_order": 1},
    {"name": "Usados", "description": "Revisados y con informe de dominio.", "sort_order": 2},
]

AUTOS = [
    {
        "categoria": "Usados",
        "name": "Toyota Corolla XEI 2019",
        "description": "Unico dueno, service oficial al dia. Cubiertas nuevas.",
        "price": "18500000.00",
        "ficha": [("Año", "2019"), ("Kilometros", "80.000"), ("Combustible", "Nafta"), ("Caja", "Automatica")],
        "fotos": 3,
    },
    {
        "categoria": "Usados",
        "name": "Volkswagen Amarok V6 Highline 2021",
        "description": "4x4, cuero, camara de retroceso. Impecable estado general.",
        "price": "42000000.00",
        "ficha": [("Año", "2021"), ("Kilometros", "62.000"), ("Combustible", "Diesel"), ("Caja", "Automatica")],
        "fotos": 3,
    },
    {
        "categoria": "0km",
        "name": "Fiat Cronos Drive 1.3",
        "description": "Patentamiento incluido. Entrega inmediata.",
        "price": "24900000.00",
        "ficha": [("Año", "2024"), ("Kilometros", "0"), ("Combustible", "Nafta"), ("Caja", "Manual")],
        "fotos": 2,
    },
    {
        "categoria": "Usados",
        "name": "Ford Ranger XLT 3.2 2022",
        "description": "Cubierta de caja, barras. Titular al dia.",
        "price": "38500000.00",
        "ficha": [("Año", "2022"), ("Kilometros", "45.000"), ("Combustible", "Diesel"), ("Caja", "Automatica")],
        "fotos": 3,
    },
    {
        "categoria": "0km",
        "name": "Peugeot 208 Allure 1.6",
        "description": "Pantalla tactil, sensores de estacionamiento.",
        "price": "27300000.00",
        "ficha": [("Año", "2024"), ("Kilometros", "0"), ("Combustible", "Nafta"), ("Caja", "Automatica")],
        "fotos": 2,
    },
    {
        "categoria": "Usados",
        "name": "Chevrolet Onix LT 1.4 2020",
        "description": "Ideal primer auto. Bajo consumo, muy buen estado.",
        "price": "15900000.00",
        "ficha": [("Año", "2020"), ("Kilometros", "95.000"), ("Combustible", "Nafta"), ("Caja", "Manual")],
        "fotos": 2,
    },
]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Carga una concesionaria de ejemplo.")
    p.add_argument("--domain", required=True, help="Dominio de la tienda, ya creada con manage.py")
    p.add_argument(
        "--reemplazar",
        action="store_true",
        help="Borra los productos y categorias que ya tenga esa tienda antes de cargar",
    )
    return p.parse_args()


def main() -> None:
    args = parse_args()
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter(Tenant.domain == args.domain).first()
        if not tenant:
            raise SystemExit(
                f"No existe la tienda {args.domain}. Creala con:\n"
                f"  python scripts/manage.py crear-tienda --domain {args.domain} --name '...' --email '...'"
            )

        existentes = db.query(Product).filter(Product.tenant_id == tenant.id).count()
        if existentes and not args.reemplazar:
            raise SystemExit(
                f"La tienda {args.domain} ya tiene {existentes} productos. "
                "Usa --reemplazar si queres borrarlos y cargar los de ejemplo."
            )
        if args.reemplazar:
            db.query(Product).filter(Product.tenant_id == tenant.id).delete()
            db.query(Category).filter(Category.tenant_id == tenant.id).delete()
            db.flush()
            print(f"- se borraron los productos y categorias previos de {args.domain}")

        perfil = db.query(StoreProfile).filter(StoreProfile.tenant_id == tenant.id).first()
        if not perfil:
            perfil = StoreProfile(tenant_id=tenant.id, business_name=PERFIL["business_name"])
            db.add(perfil)
        for campo, valor in PERFIL.items():
            setattr(perfil, campo, valor)
        print(f"= perfil actualizado: {PERFIL['business_name']}")

        por_nombre: dict[str, Category] = {}
        for datos in CATEGORIAS:
            categoria = Category(tenant_id=tenant.id, **datos)
            db.add(categoria)
            db.flush()
            por_nombre[datos["name"]] = categoria
            print(f"+ categoria: {datos['name']}")

        for orden, auto in enumerate(AUTOS, start=1):
            producto = Product(
                tenant_id=tenant.id,
                category_id=por_nombre[auto["categoria"]].id,
                name=auto["name"],
                description=auto["description"],
                price=auto["price"],
                sort_order=orden,
                attributes=[{"label": etiqueta, "value": valor} for etiqueta, valor in auto["ficha"]],
            )
            semilla = auto["name"].lower().replace(" ", "-")
            producto.images = [
                ProductImage(
                    url=f"https://picsum.photos/seed/{semilla}-{i}/1200/800",
                    alt=f"{auto['name']} - foto {i + 1}",
                    sort_order=i,
                )
                for i in range(auto["fotos"])
            ]
            db.add(producto)
            print(f"+ {auto['name']} ({auto['categoria']}, {auto['fotos']} fotos)")

        db.commit()
        print(f"\nListo: {len(AUTOS)} autos en {args.domain}.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
