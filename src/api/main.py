from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import ofertas, macro, contexto, agente, comparar
from src.database import init_db

app = FastAPI(
    title="BTG Ofertas Primárias API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(ofertas.router, prefix="/api")
app.include_router(macro.router, prefix="/api")
app.include_router(contexto.router, prefix="/api")
app.include_router(agente.router, prefix="/api")
app.include_router(comparar.router, prefix="/api")

@app.get("/api/status")
def status():
    from src.database import get_session, Oferta
    with get_session() as session:
        total = session.query(Oferta).count()
    return {"status": "online", "total_ofertas": total}