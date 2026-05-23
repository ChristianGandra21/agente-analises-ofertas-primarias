from langchain_core.tools import tool
from src.database import get_session, IndicadorMacro

# Unidades de cada série, para exibição clara ao LLM
_UNIDADES = {
    "selic":   "% a.a.",
    "ipca":    "% a.a. (acum. 12m)",
    "usd_brl": "BRL por USD",
}

@tool
def consultar_macro() -> str:
    """
    Retorna os últimos valores de Selic (% a.a.), IPCA (% a.a. acum. 12m) e câmbio USD/BRL.
    Use quando precisar de contexto macroeconômico para explicar variações de taxa.
    IMPORTANTE: os valores já estão em percentual anual — nunca os trate como decimais.
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
            unidade = _UNIDADES.get(serie, "")
            if registro:
                resultado.append(
                    f"{serie}: {registro.valor} {unidade} (data: {registro.data})"
                )
            else:
                resultado.append(f"{serie}: dados não disponíveis")
        return "\n".join(resultado)