# MyStoreEXE

Plataforma multi-tenant de tiendas. Un backend sirve a varias tiendas y el
tenant se resuelve por el dominio del request (header `Host`).

```
backend/   API FastAPI (auth JWT, CRUD del panel y API publica de la tienda)
db/        Migraciones Alembic
admin/     Panel de administracion (React + Vite + Tailwind)
proxy/     [pendiente] nginx: dominio -> tenant
tiendas/   [pendiente] la tienda publica
```

## Arranque

Necesitas **Docker Desktop** y **Node 20+**.

```bash
# 1. Configuracion
cp .env.example .env
# El .env.example trae placeholders a proposito: cambia al menos
# SECRET_KEY, POSTGRES_PASSWORD (tambien dentro de DATABASE_URL) y
# SEED_ADMIN_PASSWORD antes de seguir. Para generar una clave:
#   docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_urlsafe(48))"

# 2. Base de datos + API (aplica las migraciones al levantar)
docker compose up -d

# 3. Tenant y usuario admin iniciales.
#    Sin esto la base esta vacia y el login devuelve 404 "Tenant no encontrado",
#    porque no hay ningun tenant con el dominio por el que entras.
docker compose exec backend python scripts/seed.py

# 4. Panel
cd admin/frontend
npm install
npm run dev
```

Panel en http://localhost:5173, API en http://localhost:8000/docs.
Credenciales por defecto: las de `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

> El seed crea el tenant con dominio `localhost` a proposito: en desarrollo el
> `Host` que llega al backend es `localhost`, asi que es el unico dominio que
> resuelve. Para simular otra tienda, agregala en `C:\Windows\System32\drivers\etc\hosts`
> y sembrala con `--domain`.

## Gestion de la plataforma

Las tiendas y sus cuentas de admin se manejan con `backend/scripts/manage.py`.
Esto es para el dueno de la plataforma: el catalogo lo maneja cada cliente
desde su panel.

```bash
docker compose exec backend python scripts/manage.py tiendas
docker compose exec backend python scripts/manage.py crear-tienda --domain tienda1.com --name "Tienda Uno" --email dueno@tienda1.com
docker compose exec backend python scripts/manage.py crear-admin --domain tienda1.com --email otro@tienda1.com
docker compose exec backend python scripts/manage.py password --domain tienda1.com --email dueno@tienda1.com
docker compose exec backend python scripts/manage.py baja-tienda --domain tienda1.com
docker compose exec backend python scripts/manage.py alta-tienda --domain tienda1.com
```

Si no pasas `--password` se genera una y se imprime **una sola vez**.

El dominio se normaliza solo: `HTTPS://Tienda1.com/` se guarda como
`tienda1.com`, que es contra lo que compara `get_tenant`.

`baja-tienda` es una baja logica: el dominio deja de resolver (panel y tienda
publica responden 404) pero los datos quedan y `alta-tienda` la reactiva.

> Dar de alta una tienda en la base es **un paso de tres**. Tambien hay que
> apuntar el DNS del dominio al servidor y agregarle el bloque en nginx
> (`proxy/`, todavia pendiente).

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

Corren contra SQLite en memoria: no hace falta Docker ni Postgres. Si no tenes
Python instalado en el host, van dentro del contenedor (hay que reinstalar las
dependencias de test cada vez que se recrea):

```bash
docker compose exec backend sh -c "pip install -q -r requirements-dev.txt && pytest"
```

## Estado

**Panel de administracion — completo.**

| Pantalla | Que hace |
|---|---|
| Login | JWT; si el token vence te devuelve al login solo |
| Dashboard | Contadores reales, tarjetas que linkean a su seccion y pendientes de configuracion |
| Mi Tienda | Perfil de la tienda (nombre, descripcion, contacto, logo) |
| Categorias | Alta, edicion, baja y orden |
| Productos | Alta, edicion, baja, precio, categoria y filtro por categoria |

Las bajas son **logicas** (`is_active = false`): no se muestran, pero siguen en
la base. Para verlas, `?include_inactive=true` en los listados de la API.

**API publica de la tienda — completa.**

Sin autenticacion, resuelve el tenant por `Host` igual que el panel y solo
devuelve lo activo. Nunca expone `tenant_id` ni `is_active`.

| Endpoint | Que devuelve |
|---|---|
| `GET /store/profile` | Datos del negocio |
| `GET /store/categories` | Categorias activas, ordenadas |
| `GET /store/products` | Productos activos; `?category_id=` filtra |

Filtrar por una categoria dada de baja o de otra tienda devuelve **404**: para
el visitante esa categoria no existe.

**Pendiente:** el front de la tienda (`tiendas/`, una carpeta por tienda) y el
proxy que rutea dominio -> tenant (`proxy/`). Tampoco hay subida de imagenes
(por ahora se pega una URL), gestion de usuarios admin, ni busqueda/paginacion
en los listados.
