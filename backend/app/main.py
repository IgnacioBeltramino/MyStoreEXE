import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from app.routers.auth import router as auth_router  # noqa: E402
from app.routers.admin import router as admin_router  # noqa: E402

app = FastAPI(title="MyStoreEXE API")

# En dev el panel entra por el proxy de Vite y no necesita CORS, pero si el
# front se sirve desde otro dominio (produccion) el navegador lo bloquea.
_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)


@app.get("/health")
def health():
    return {"status": "ok"}
