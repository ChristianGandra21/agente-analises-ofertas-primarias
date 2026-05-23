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
    resumo: str


def _gerar_resumo(a, b, spread, vencedor) -> str:
    if spread is None:
        return "Não foi possível calcular o spread — taxa numérica indisponível."
    nome_a = a.nome or a.emissor or "Ativo A"
    nome_b = b.nome or b.emissor or "Ativo B"
    abs_spread = abs(spread)
    if vencedor == "a":
        return f"{nome_a} paga {abs_spread:.2f}pp a mais que {nome_b}."
    elif vencedor == "b":
        return f"{nome_b} paga {abs_spread:.2f}pp a mais que {nome_a}."
    return "Os dois ativos têm a mesma taxa."


@router.post("/comparar", response_model=CompararResponse)
def comparar(req: CompararRequest):
    with get_session() as session:
        a = session.get(Oferta, req.ativo_a)
        b = session.get(Oferta, req.ativo_b)

        if not a or not b:
            raise HTTPException(status_code=404, detail="Ativo não encontrado")

        spread = None
        vencedor = "empate"
        if a.taxa_valor is not None and b.taxa_valor is not None:
            spread = round(a.taxa_valor - b.taxa_valor, 4)
            vencedor = "a" if spread > 0 else "b" if spread < 0 else "empate"

        resumo = _gerar_resumo(a, b, spread, vencedor)

        return CompararResponse(
            ativo_a=OfertaSchema.model_validate(a),
            ativo_b=OfertaSchema.model_validate(b),
            spread=spread,
            vencedor=vencedor,
            resumo=resumo,
        )
