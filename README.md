# MyStoreEXE

Plataforma multi-tenant de tiendas. Un backend sirve a varias tiendas y el
tenant se resuelve por el dominio del request (header `Host`).

```
backend/   API FastAPI (auth JWT + CRUD del panel)
db/        Migraciones Alembic
admin/     Panel de administracion (React + Vite + Tailwind)
proxy/     [pendiente] nginx: dominio -> tenant
tiendas/   [pendiente] la tienda publica
```

## Arranque

Necesitas **Docker Desktop** y **Node 20+**.

```bash
# 1. Configuracion
cp .env.example .env          # ajusta SECRET_KEY si vas a produccion

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

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

Corren contra SQLite en memoria: no hace falta Docker ni Postgres.

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

**Pendiente:** la tienda publica (`tiendas/`) y el proxy que rutea dominio ->
tenant (`proxy/`). Tampoco hay subida de imagenes (por ahora se pega una URL),
gestion de usuarios admin, ni busqueda/paginacion en los listados.
