from pydantic import BaseModel
from typing import Optional

class OfertaSchema(BaseModel):
    id: int
    fonte: str
    emissor: Optional[str]
    instituicao: Optional[str]
    nome: Optional[str]
    tipo: Optional[str]
    indexador: Optional[str]
    taxa_bruta: Optional[str]
    taxa_valor: Optional[float]
    data_vencimento: Optional[str]
    com_fgc: Optional[bool]
    isento_ir: Optional[bool]

    class Config:
        from_attributes = True


class MacroSchema(BaseModel):
    serie: str
    valor: float
    data: str


class ContextoSchema(BaseModel):
    id: int
    tipo: Optional[str]
    instituicao: Optional[str]
    data_referencia: Optional[str]
    resumo_estrategia: Optional[str]
    fonte_url: Optional[str]

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    pergunta: str
    conversa_id: Optional[int] = None


class ChatResponse(BaseModel):
    resposta: str
    valida: bool = True
    agentes_acionados: list[str] = []
    duracao_segundos: float = 0.0
    conversa_id: Optional[int] = None


class ConversationCreate(BaseModel):
    titulo: Optional[str] = None


class ConversationSchema(BaseModel):
    id: int
    titulo: str
    criado_em: str
    atualizado_em: str
    total_mensagens: int


class ChatMessageSchema(BaseModel):
    id: int
    role: str
    content: str
    timestamp: str
    agentes_acionados: list[str] = []
    duracao_segundos: Optional[float] = None