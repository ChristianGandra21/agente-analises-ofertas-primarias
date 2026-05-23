import time as time_module
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.api.schemas import ChatRequest, ChatResponse, ConversationSchema, ChatMessageSchema
from src.agents.orchestrator import responder
from src.database import get_session, Conversa, Mensagem
from datetime import datetime, timezone
from loguru import logger

router = APIRouter()


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _to_iso(dt: datetime | None) -> str:
    if dt is None:
        return ""
    return dt.isoformat()


def _validar_resposta(resposta: str) -> bool:
    frases_invalidas = [
        "consulte um especialista",
        "consultar um especialista",
    ]
    if len(resposta) < 50:
        return False
    for frase in frases_invalidas:
        if frase.lower() in resposta.lower():
            return False
    return True


# ─── Chat principal ───────────────────────────────────────────────────────────

@router.post("/agente/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    inicio = time_module.time()

    # Recuperar ou criar conversa
    conversa_id = request.conversa_id
    with get_session() as session:
        if conversa_id:
            conversa = session.get(Conversa, conversa_id)
            if not conversa:
                raise HTTPException(status_code=404, detail="Conversa não encontrada")
        else:
            # Criar nova conversa com título derivado da pergunta
            titulo = request.pergunta[:80] if len(request.pergunta) > 80 else request.pergunta
            conversa = Conversa(
                titulo=titulo,
                criado_em=datetime.now(timezone.utc),
                atualizado_em=datetime.now(timezone.utc),
            )
            session.add(conversa)
            session.flush()  # garante ID antes do commit
            conversa_id = conversa.id

        # Salvar mensagem do usuário
        msg_user = Mensagem(
            conversa_id=conversa_id,
            role="user",
            conteudo=request.pergunta,
            criada_em=datetime.now(timezone.utc),
        )
        session.add(msg_user)

        # Atualizar timestamp da conversa
        conversa.atualizado_em = datetime.now(timezone.utc)
        session.commit()

    # Gerar resposta
    try:
        resposta = responder(request.pergunta)
    except Exception as e:
        logger.error(f"Erro ao chamar responder(): {e}")
        resposta = f"Ocorreu um erro ao processar sua pergunta: {str(e)}"

    duracao = round(time_module.time() - inicio, 1)

    # Salvar resposta do agente
    with get_session() as session:
        msg_agent = Mensagem(
            conversa_id=conversa_id,
            role="agent",
            conteudo=resposta,
            agentes_acionados=json.dumps(["contextualista", "analista"]),
            duracao_segundos=duracao,
            criada_em=datetime.now(timezone.utc),
        )
        session.add(msg_agent)
        session.commit()

    return ChatResponse(
        resposta=resposta,
        valida=_validar_resposta(resposta),
        agentes_acionados=["contextualista", "analista"],
        duracao_segundos=duracao,
        conversa_id=conversa_id,
    )


# ─── Conversas ────────────────────────────────────────────────────────────────

@router.get("/agente/conversas", response_model=list[ConversationSchema])
def listar_conversas():
    with get_session() as session:
        conversas = (
            session.query(Conversa)
            .order_by(Conversa.atualizado_em.desc())
            .limit(50)
            .all()
        )
        resultado = []
        for c in conversas:
            total = session.query(Mensagem).filter_by(conversa_id=c.id).count()
            resultado.append(ConversationSchema(
                id=c.id,
                titulo=c.titulo,
                criado_em=_to_iso(c.criado_em),
                atualizado_em=_to_iso(c.atualizado_em),
                total_mensagens=total,
            ))
        return resultado


@router.post("/agente/conversas", response_model=ConversationSchema)
def criar_conversa(body: Optional[dict] = None):
    titulo = (body or {}).get("titulo") or "Nova conversa"
    with get_session() as session:
        conversa = Conversa(
            titulo=titulo,
            criado_em=datetime.now(timezone.utc),
            atualizado_em=datetime.now(timezone.utc),
        )
        session.add(conversa)
        session.commit()
        session.refresh(conversa)
        return ConversationSchema(
            id=conversa.id,
            titulo=conversa.titulo,
            criado_em=_to_iso(conversa.criado_em),
            atualizado_em=_to_iso(conversa.atualizado_em),
            total_mensagens=0,
        )


@router.get("/agente/conversas/{conversa_id}/mensagens", response_model=list[ChatMessageSchema])
def listar_mensagens(conversa_id: int):
    with get_session() as session:
        conversa = session.get(Conversa, conversa_id)
        if not conversa:
            raise HTTPException(status_code=404, detail="Conversa não encontrada")

        mensagens = (
            session.query(Mensagem)
            .filter_by(conversa_id=conversa_id)
            .order_by(Mensagem.criada_em.asc())
            .all()
        )
        return [
            ChatMessageSchema(
                id=m.id,
                role=m.role,
                content=m.conteudo,
                timestamp=_to_iso(m.criada_em),
                agentes_acionados=json.loads(m.agentes_acionados) if m.agentes_acionados else [],
                duracao_segundos=m.duracao_segundos,
            )
            for m in mensagens
        ]
