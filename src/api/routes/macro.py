from fastapi import APIRouter, Query
from src.database import get_session, IndicadorMacro
from src.api.schemas import MacroSchema

router = APIRouter()

@router.get("/macro", response_model=list[MacroSchema])
def get_macro():
    with get_session() as session:
        resultado = []
        for serie in ["selic", "ipca", "usd_brl"]:
            registro = (
                session.query(IndicadorMacro)
                .filter_by(serie=serie)
                .order_by(IndicadorMacro.data.desc())
                .first()
            )
            if registro:
                resultado.append(registro)
        return resultado


@router.get("/macro/historico")
def get_historico(
    series: str = "selic,ipca,usd_brl",
    limite: int = 30,
):
    with get_session() as session:
        resultado = {}
        for serie in series.split(","):
            serie = serie.strip()
            registros = (
                session.query(IndicadorMacro)
                .filter_by(serie=serie)
                .order_by(IndicadorMacro.data.desc())
                .limit(limite)
                .all()
            )
            resultado[serie] = [
                {"data": r.data, "valor": r.valor}
                for r in reversed(registros)
            ]
        return resultado