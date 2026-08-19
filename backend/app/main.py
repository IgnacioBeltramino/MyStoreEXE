from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router

app = FastAPI(title="MyStoreEXE API")

app.include_router(auth_router)
app.include_router(admin_router)


@app.get("/health")
def health():
    return {"status": "ok"}
