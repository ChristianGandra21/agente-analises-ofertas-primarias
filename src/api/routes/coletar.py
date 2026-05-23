from fastapi import APIRouter, BackgroundTasks
from loguru import logger

router = APIRouter()


def _coletar_tudo():
    """Executa coleta de dados em background."""
    logger.info("Coleta manual iniciada...")
    try:
        from src.data_ingestion.bcb import coletar_indicadores, salvar_indicadores

        dados = coletar_indicadores(n=30)
        salvar_indicadores(dados)
    except ImportError:
        logger.warning("Módulo src.data_ingestion.bcb não disponível")
    try:
        from src.data_ingestion.tavily import get_contexto_completo

        get_contexto_completo()
    except ImportError:
        logger.warning("Módulo src.data_ingestion.tavily não disponível")
    logger.success("Coleta manual concluída.")


@router.post("/coletar")
def disparar_coleta(background_tasks: BackgroundTasks):
    background_tasks.add_task(_coletar_tudo)
    return {"status": "iniciado", "mensagem": "Coleta iniciada em background"}
