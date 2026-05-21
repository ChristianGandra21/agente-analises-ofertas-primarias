from langchain_core.tools import tool
from src.database import get_session, IndicadorMacro

@tool
def consultar_macro() -> str:
    """
    Retorna os últimos valores de Selic, IPCA e câmbio USD/BRL.
    Use quando precisar de contexto macroeconômico para explicar variações de taxa.
    """
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
                resultado.append(f"{serie}: {registro.valor} ({registro.data})")
            else:
                resultado.append(f"{serie}: dados não disponíveis")
        return "\n".join(resultado)