from fastapi import APIRouter, Query
from src.database import get_session, Oferta
from src.api.schemas import OfertaSchema

router = APIRouter()

@router.get("/ofertas", response_model=list[OfertaSchema])
def get_ofertas(
    tipo: str = Query(default=""),
    indexador: str = Query(default=""),
    instituicao: str = Query(default=""),
    limite: int = Query(default=50),
):
    with get_session() as session:
        query = session.query(Oferta)

        if tipo:
            query = query.filter(Oferta.tipo.ilike(f"%{tipo}%"))
        if indexador:
            query = query.filter(Oferta.indexador.ilike(f"%{indexador}%"))
        if instituicao:
            query = query.filter(Oferta.instituicao.ilike(f"%{instituicao}%"))

        return query.limit(limite).all()