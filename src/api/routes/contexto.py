from fastapi import APIRouter, Query
from src.database import get_session, ContextoNoticia
from src.api.schemas import ContextoSchema

router = APIRouter()

@router.get("/contexto", response_model=list[ContextoSchema])
def get_contexto(
    tema: str = Query(default=""),
    limite: int = Query(default=10),
):
    with get_session() as session:
        query = session.query(ContextoNoticia)

        if tema:
            query = query.filter(
                ContextoNoticia.resumo_estrategia.ilike(f"%{tema}%")
            )

        return query.limit(limite).all()