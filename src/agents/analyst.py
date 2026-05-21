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
Use as ferramentas disponíveis para buscar dados reais antes de responder.

REGRAS INVIOLÁVEIS — NUNCA as quebre:
1. NUNCA invente, crie ou sugira ofertas que não foram retornadas pelas ferramentas.
2. Se a ferramenta retornar que não há ofertas de determinado tipo (ex: CDB), informe isso
   diretamente ao usuário — NÃO apresente CRAs, DEBs ou qualquer outro tipo como substituto.
3. O campo [TIPO:] de cada oferta retornada pela ferramenta é o tipo real do ativo.
   Nunca reclassifique ou renomeie o tipo — reporte exatamente o que a ferramenta devolveu.
4. Se não houver dados suficientes para responder, diga claramente que os dados não estão
   disponíveis na base atual."""

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