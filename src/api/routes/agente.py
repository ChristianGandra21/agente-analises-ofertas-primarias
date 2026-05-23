from fastapi import APIRouter
from src.api.schemas import ChatRequest, ChatResponse
from src.agents.orchestrator import responder

router = APIRouter()

@router.post("/agente/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    resposta = responder(request.pergunta)
    return ChatResponse(resposta=resposta)