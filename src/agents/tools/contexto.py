from langchain_core.tools import tool
from src.database import get_session, ContextoNoticia

@tool
def consultar_contexto(tema: str = "") -> str:
    """
    Retorna notícias e carteiras recomendadas sobre o mercado de renda fixa.
    Use para contextualizar variações de taxa com eventos macroeconômicos recentes.
    Exemplos: tema='Selic', tema='BTG', tema=''(retorna tudo)
    """
    with get_session() as session:
        query = session.query(ContextoNoticia)

        if tema:
            query = query.filter(
                ContextoNoticia.resumo_estrategia.ilike(f"%{tema}%")
            )

        query = query.filter(ContextoNoticia.resumo_estrategia.isnot(None))
        query = query.limit(10)

        resultados = []
        for noticia in query.all():
            resultados.append(
                f"Instituição: {noticia.instituicao}\n"
                f"Referência: {noticia.data_referencia}\n"
                f"Resumo: {noticia.resumo_estrategia}\n"
                "---"
            )

        return "\n".join(resultados) if resultados else "Nenhuma notícia encontrada para o tema fornecido."