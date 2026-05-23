from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
from loguru import logger

from src.agents.tools.macro import consultar_macro
from src.agents.tools.contexto import consultar_contexto

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

SYSTEM_PROMPT = """Você é um especialista em macroeconomia brasileira e mercado de renda fixa.

REGRAS OBRIGATÓRIAS:
1. SEMPRE chame consultar_macro para obter Selic, IPCA e câmbio atuais — nunca use valores de memória
2. Chame consultar_contexto para obter carteiras e estratégias recentes das instituições
3. Use os dados retornados pelas ferramentas — nunca invente indicadores
4. Correlacione os dados macro com o contexto de mercado
5. Cite os valores exatos retornados pelas ferramentas, incluindo datas
6. Se consultar_contexto não retornar dados, foque nos indicadores macro e dispense a análise de carteiras

Contexto: estamos em maio de 2026."""

tools = [consultar_macro, consultar_contexto]
agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)


def contextualizar(pergunta: str) -> str:
    """
    Recebe uma pergunta e retorna análise de contexto usando as tools disponíveis.
    """
    try:
        resultado = agent.invoke(
            {"messages": [{"role": "user", "content": pergunta}]}
        )
        return resultado["messages"][-1].content
    except Exception as e:
        logger.error(f"Erro no agente de contexto: {e}")
        return f"Erro ao consultar contexto macroeconômico: {str(e)}"