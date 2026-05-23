import time as time_module
from fastapi import APIRouter
from src.api.schemas import ChatRequest, ChatResponse
from src.agents.orchestrator import responder

router = APIRouter()


def _validar_resposta(resposta: str) -> bool:
    frases_invalidas = [
        "não foi possível encontrar",
        "não tenho acesso",
        "não disponível",
        "consulte um especialista",
        "consultar um especialista",
    ]
    if len(resposta) < 100:
        return False
    if not any(c.isdigit() for c in resposta):
        return False
    for frase in frases_invalidas:
        if frase.lower() in resposta.lower():
            return False
    return True


@router.post("/agente/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    inicio = time_module.time()
    resposta = responder(request.pergunta)
    duracao = round(time_module.time() - inicio, 1)

    return ChatResponse(
        resposta=resposta,
        valida=_validar_resposta(resposta),
        agentes_acionados=["contextualista", "analista"],
        duracao_segundos=duracao,
    )
