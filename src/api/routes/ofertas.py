from fastapi import APIRouter, Query
from sqlalchemy import case
from src.database import get_session, Oferta
from src.api.schemas import OfertaSchema

router = APIRouter()


@router.get("/ofertas", response_model=list[OfertaSchema])
def get_ofertas(
    tipo: str = Query(default=""),
    indexador: str = Query(default=""),
    instituicao: str = Query(default=""),
    fonte: str = Query(default=""),
    limite: int = Query(default=50),
    apenas_com_taxa: bool = Query(default=True),
):
    with get_session() as session:
        query = session.query(Oferta)

        if apenas_com_taxa:
            query = query.filter(Oferta.taxa_bruta.isnot(None))

        if tipo:
            query = query.filter(Oferta.tipo.ilike(f"%{tipo}%"))

        if indexador:
            query = query.filter(Oferta.indexador.ilike(f"%{indexador}%"))

        if instituicao:
            query = query.filter(Oferta.instituicao.ilike(f"%{instituicao}%"))

        if fonte:
            query = query.filter(Oferta.fonte == fonte)

        query = query.order_by(
            case(
                (Oferta.fonte == "meelion", 0),
                (Oferta.fonte == "seed", 1),
                (Oferta.fonte == "jina", 2),
                else_=3,
            ),
            Oferta.data_coleta.desc(),
        )

        return query.limit(limite).all()
