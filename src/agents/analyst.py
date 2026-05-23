from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
import os

from src.agents.tools.ofertas import consultar_ofertas, comparar_taxas, buscar_oferta_por_nome

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

SYSTEM_PROMPT = """Você é um analista especializado em renda fixa brasileira.

REGRAS OBRIGATÓRIAS:
1. SEMPRE chame a ferramenta consultar_ofertas antes de responder qualquer pergunta sobre ativos
2. Se a ferramenta retornar dados, USE esses dados na resposta — nunca invente taxas
3. Se a ferramenta não retornar dados, informe claramente que não há dados disponíveis
4. Nunca sugira consultar especialistas — você É o especialista
5. Respostas devem ser objetivas, em português, com dados concretos e citando a fonte
6. Se o usuário mencionar um ativo específico como 'CDB C6' ou 'CRA Marfrig', use buscar_oferta_por_nome

Você tem acesso a ofertas reais de BTG, XP, Ágora, Itaú e Genial.
Sempre filtre por instituição, tipo ou indexador quando o usuário mencionar."""

tools = [consultar_ofertas, comparar_taxas, buscar_oferta_por_nome]
agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)


def analisar(pergunta: str) -> str:
    """
    Recebe uma pergunta e retorna análise de ofertas usando as tools disponíveis.
    """
    resultado = agent.invoke(
        {"messages": [{"role": "user", "content": pergunta}]}
    )
    return resultado["messages"][-1].content