from fastapi import FastAPI

app = FastAPI(title="MyStoreEXE API")

@app.get("/health")
def health():
    return {"status": "ok"}
