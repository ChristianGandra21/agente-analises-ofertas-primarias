import time as time_module
from fastapi import APIRouter
from src.api.schemas import ChatRequest, ChatResponse
from src.agents.orchestrator import responder

router = APIRouter()

@router.post("/agente/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    inicio = time_module.time()
    resposta = responder(request.pergunta)
    duracao = round(time_module.time() - inicio, 2)
    return ChatResponse(
        resposta=resposta,
        agentes_acionados=["analista", "contextualista"],
        duracao_segundos=duracao,
    )