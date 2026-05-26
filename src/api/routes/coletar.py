from fastapi import APIRouter, BackgroundTasks
from loguru import logger
from datetime import datetime, timezone

router = APIRouter()

_ultima_coleta: dict = {"timestamp": None, "status": "idle"}


@router.post("/coletar")
def disparar_coleta(background_tasks: BackgroundTasks):
    if _ultima_coleta["status"] == "running":
        return {"status": "already_running", "mensagem": "Coleta já em andamento"}

    background_tasks.add_task(_coletar_tudo)
    return {"status": "iniciado", "mensagem": "Coleta iniciada em background"}


@router.get("/coletar/status")
def status_coleta():
    return _ultima_coleta


def _coletar_tudo():
    global _ultima_coleta
    _ultima_coleta = {"status": "running", "timestamp": datetime.now(timezone.utc).isoformat()}

    try:
        from src.ingestion.bcb import coletar_indicadores, salvar_indicadores

        logger.info("Coleta manual: BCB...")
        dados = coletar_indicadores(n=30)
        inseridos = salvar_indicadores(dados)
        logger.success(f"BCB: {inseridos} registros inseridos")
    except ImportError:
        logger.warning("Módulo src.ingestion.bcb não disponível")

    try:
        from src.ingestion.tavily import get_contexto_completo

        logger.info("Coleta manual: Tavily...")
        get_contexto_completo()
        logger.success("Tavily: contexto atualizado")
    except ImportError:
        logger.warning("Módulo src.ingestion.tavily não disponível")

    _ultima_coleta["status"] = "success"
    logger.success("Coleta manual concluída.")
