from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.database import get_session, Oferta
from src.api.schemas import OfertaSchema

router = APIRouter()


class CompararRequest(BaseModel):
    ativo_a: int
    ativo_b: int


class CompararResponse(BaseModel):
    ativo_a: OfertaSchema
    ativo_b: OfertaSchema
    spread: float | None
    vencedor: str


@router.post("/comparar", response_model=CompararResponse)
def comparar(req: CompararRequest):
    with get_session() as session:
        a = session.query(Oferta).get(req.ativo_a)
        b = session.query(Oferta).get(req.ativo_b)

        if not a or not b:
            raise HTTPException(status_code=404, detail="Ativo não encontrado")

        spread = None
        if a.taxa_valor is not None and b.taxa_valor is not None:
            spread = round(a.taxa_valor - b.taxa_valor, 2)

        vencedor = (
            "a" if (spread is not None and spread > 0)
            else "b" if (spread is not None and spread < 0)
            else "empate"
        )

        return CompararResponse(
            ativo_a=OfertaSchema.model_validate(a),
            ativo_b=OfertaSchema.model_validate(b),
            spread=spread,
            vencedor=vencedor,
        )
