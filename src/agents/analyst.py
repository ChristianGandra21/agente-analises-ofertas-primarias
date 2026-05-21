from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
import os

from src.agents.tools.ofertas import consultar_ofertas, comparar_taxas

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

SYSTEM_PROMPT = """Você é um analista especializado em renda fixa brasileira.
Sua função é analisar ofertas primárias, comparar taxas e identificar padrões.
Sempre responda em português, de forma objetiva e estruturada.
Use as ferramentas disponíveis para buscar dados reais antes de responder."""

tools = [consultar_ofertas, comparar_taxas]
agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)


def analisar(pergunta: str) -> str:
    """
    Recebe uma pergunta e retorna análise de ofertas usando as tools disponíveis.
    """
    resultado = agent.invoke(
        {"messages": [{"role": "user", "content": pergunta}]}
    )
    return resultado["messages"][-1].content