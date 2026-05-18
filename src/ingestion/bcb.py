"""
Coleta indicadores macroeconômicos do Banco Central do Brasil (API SGS).

Séries coletadas:
    - Selic diária        (código 11)
    - IPCA mensal         (código 433)
    - USD/BRL diário      (código 1)

Uso direto:
    python -m src.data_ingestion.bcb
"""

import requests
import requests_cache
from loguru import logger
from datetime import datetime

from src.database import IndicadorMacro, get_session, init_db

# ─── Cache (evita bater na API repetidamente durante dev) ────────────────────

requests_cache.install_cache("data/db/bcb_cache", expire_after=3600)

# ─── Séries disponíveis ──────────────────────────────────────────────────────

SERIES = {
    "selic":   {"codigo": 11,  "descricao": "Taxa Selic diária"},
    "ipca":    {"codigo": 433, "descricao": "IPCA mensal"},
    "usd_brl": {"codigo": 1,   "descricao": "Taxa de câmbio USD/BRL"},
}

BCB_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados/ultimos/{n}?formato=json"


# ─── Coleta ──────────────────────────────────────────────────────────────────

def fetch_serie(codigo: int, n: int = 30) -> list[dict]:
    """Busca os últimos N registros de uma série do BCB."""
    url = BCB_URL.format(codigo=codigo, n=n)
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    return resp.json()


def coletar_indicadores(n: int = 30) -> dict[str, list[dict]]:
    """
    Coleta todas as séries definidas em SERIES.

    Args:
        n: Número de registros mais recentes a buscar por série.

    Returns:
        Dicionário { nome_serie: [{"data": ..., "valor": ...}, ...] }
    """
    resultados = {}

    for nome, config in SERIES.items():
        try:
            logger.info(f"Coletando {config['descricao']} (código {config['codigo']})...")
            dados = fetch_serie(config["codigo"], n)
            resultados[nome] = dados
            logger.success(f"  → {len(dados)} registros obtidos")
        except Exception as e:
            logger.error(f"  → Erro ao coletar {nome}: {e}")
            resultados[nome] = []

    return resultados


# ─── Persistência ────────────────────────────────────────────────────────────

def salvar_indicadores(dados: dict[str, list[dict]]) -> int:
    """
    Salva os indicadores no banco, ignorando duplicatas (mesma série + data).

    Returns:
        Número de registros inseridos.
    """
    inseridos = 0

    with get_session() as session:
        for nome, registros in dados.items():
            config = SERIES[nome]

            for r in registros:
                # Checa duplicata
                existe = session.query(IndicadorMacro).filter_by(
                    serie=nome,
                    data=r["data"],
                ).first()

                if existe:
                    continue

                indicador = IndicadorMacro(
                    serie=nome,
                    codigo_bcb=config["codigo"],
                    data=r["data"],
                    valor=float(r["valor"].replace(",", ".")),
                    data_coleta=datetime.utcnow(),
                )
                session.add(indicador)
                inseridos += 1

        session.commit()

    return inseridos


# ─── Consulta ────────────────────────────────────────────────────────────────

def get_ultimo_valor(serie: str) -> dict | None:
    """
    Retorna o registro mais recente de uma série.

    Returns:
        {"serie": ..., "data": ..., "valor": ...} ou None
    """
    with get_session() as session:
        registro = (
            session.query(IndicadorMacro)
            .filter_by(serie=serie)
            .order_by(IndicadorMacro.data.desc())
            .first()
        )
        if not registro:
            return None
        return {
            "serie": registro.serie,
            "data": registro.data,
            "valor": registro.valor,
        }


def get_resumo_macro() -> dict:
    """
    Retorna um resumo dos indicadores mais recentes.
    Usado pelo agente como contexto macro.
    """
    return {
        nome: get_ultimo_valor(nome)
        for nome in SERIES
    }


# ─── Main ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    logger.info("Iniciando coleta de indicadores BCB...")

    dados = coletar_indicadores(n=30)
    inseridos = salvar_indicadores(dados)

    logger.success(f"\n{inseridos} registros inseridos no banco.")

    logger.info("\nResumo dos últimos valores:")
    resumo = get_resumo_macro()
    for nome, info in resumo.items():
        if info:
            logger.info(f"  {nome:10s} → {info['valor']} ({info['data']})")