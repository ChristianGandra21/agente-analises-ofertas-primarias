from fastapi import APIRouter, Query
from sqlalchemy import func
from src.database import get_session, IndicadorMacro
from src.api.schemas import MacroSchema

router = APIRouter()

def _macro_data_iso_expr():
    return (
        func.substr(IndicadorMacro.data, 7, 4)
        .op("||")("-")
        .op("||")(func.substr(IndicadorMacro.data, 4, 2))
        .op("||")("-")
        .op("||")(func.substr(IndicadorMacro.data, 1, 2))
    )

@router.get("/macro", response_model=list[MacroSchema])
def get_macro():
    with get_session() as session:
        resultado = []
        for serie in ["selic", "ipca", "usd_brl"]:
            registro = (
                session.query(IndicadorMacro)
                .filter_by(serie=serie)
                .order_by(_macro_data_iso_expr().desc())
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
                .order_by(_macro_data_iso_expr().desc())
                .limit(limite)
                .all()
            )
            resultado[serie] = [
                {"data": r.data, "valor": r.valor}
                for r in reversed(registros)
            ]
        return resultado