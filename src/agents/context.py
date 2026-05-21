from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
import os

from src.agents.tools.macro import consultar_macro
from src.agents.tools.contexto import consultar_contexto

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

SYSTEM_PROMPT = """Você é um analista especializado em renda fixa brasileira.
Sua função é analisar o contexto macroeconômico e notícias recentes para explicar variações de taxas.
Sempre responda em português, de forma objetiva e estruturada.
Use as ferramentas disponíveis para buscar dados reais antes de responder."""

tools = [consultar_macro, consultar_contexto]
agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)

def contextualizar(pergunta: str) -> str:
    """
    Recebe uma pergunta e retorna análise de contexto usando as tools disponíveis.
    """
    resultado = agent.invoke(
        {"messages": [{"role": "user", "content": pergunta}]}
    )
    return resultado["messages"][-1].content