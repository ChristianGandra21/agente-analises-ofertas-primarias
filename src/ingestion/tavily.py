"""
Coleta de contexto informacional via API Tavily.

Busca notícias macroeconômicas e carteiras recomendadas
para alimentar o agente de análise de ofertas primárias.
"""

import json
import os
from datetime import datetime

from dotenv import load_dotenv
from loguru import logger
from tavily import TavilyClient

from src.database import ContextoNoticia, get_session, init_db

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
if not TAVILY_API_KEY:
    raise RuntimeError("TAVILY_API_KEY não encontrada no .env")

client = TavilyClient(api_key=TAVILY_API_KEY)

MESES_PT = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
}
DATA_REFERENCIA = f"{MESES_PT[datetime.now().month]} {datetime.now().year}"


def _buscar(query: str, max_results: int = 5) -> list[dict]:
    logger.info(f"Buscando Tavily: '{query}'")
    resp = client.search(query=query, max_results=max_results, search_depth="advanced")
    resultados = resp.get("results", [])
    logger.success(f"  → {len(resultados)} resultados para '{query}'")
    return [
        {
            "title": r["title"],
            "url": r["url"],
            "content": r["content"],
            "score": r["score"],
        }
        for r in resultados
    ]


def buscar_noticias_macro() -> list[dict]:
    QUERIES = [
        "Selic IPCA renda fixa Brasil 2026",
        "política monetária Banco Central Brasil",
        "mercado renda fixa CDB LCI LCA tendências",
    ]
    resultados = []
    for q in QUERIES:
        try:
            resultados.extend(_buscar(q))
        except Exception as e:
            logger.error(f"Erro na query '{q}': {e}")
    return resultados


def buscar_carteiras_recomendadas() -> list[dict]:
    QUERIES = [
        "carteira recomendada renda fixa XP maio 2026",
        "BTG Pactual renda fixa recomendações 2026",
        "Genial Investimentos carteira renda fixa 2026",
    ]
    resultados = []
    for q in QUERIES:
        try:
            resultados.extend(_buscar(q))
        except Exception as e:
            logger.error(f"Erro na query '{q}': {e}")
    return resultados


def salvar_contexto(resultados: list[dict], tipo: str) -> int:
    inseridos = 0
    with get_session() as session:
        existentes = {
            r.fonte_url
            for r in session.query(ContextoNoticia.fonte_url).filter(
                ContextoNoticia.tipo == tipo
            ).all()
        }
        for res in resultados:
            if res["url"] in existentes:
                continue
            noticia = ContextoNoticia(
                tipo=tipo,
                instituicao="Tavily",
                data_referencia=DATA_REFERENCIA,
                fonte_url=res["url"],
                resumo_estrategia=res["content"],
                titulos_json=json.dumps([{"title": res["title"], "score": res["score"]}]),
            )
            session.add(noticia)
            inseridos += 1
        session.commit()
    logger.success(f"  → {inseridos} novos registros '{tipo}' salvos")
    return inseridos


def get_contexto_completo() -> dict:
    init_db()
    noticias = buscar_noticias_macro()
    carteiras = buscar_carteiras_recomendadas()
    salvar_contexto(noticias, "macro")
    salvar_contexto(carteiras, "carteira")
    return {
        "noticias_macro": noticias,
        "carteiras_recomendadas": carteiras,
    }


if __name__ == "__main__":
    resultado = get_contexto_completo()
    print(json.dumps(resultado, indent=2, ensure_ascii=False, default=str))
