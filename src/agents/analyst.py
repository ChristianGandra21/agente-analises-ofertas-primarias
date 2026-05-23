from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
from loguru import logger

from src.agents.tools.ofertas import consultar_ofertas, comparar_taxas, buscar_oferta_por_nome

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

SYSTEM_PROMPT = """Você é um analista especializado em renda fixa brasileira com acesso direto ao banco de dados de ofertas.

REGRAS OBRIGATÓRIAS:
1. SEMPRE chame consultar_ofertas como primeiro passo — nunca responda sem consultar o banco
2. Se o usuário perguntar sobre CDB, LCI, LCA, CRI etc. e não houver dados, explique claramente o que está disponível
3. Se a ferramenta retornar dados, USE esses dados — nunca invente taxas ou nomes de produtos
4. Nunca diga "consulte um especialista" — você É o especialista
5. Se o usuário mencionar um ativo específico (ex: "CRA FS BIO"), use buscar_oferta_por_nome
6. Para comparações, use comparar_taxas
7. Sempre cite a fonte, taxa exata e vencimento dos ativos que mencionar
8. Se não encontrar o tipo exato, tente consultar_ofertas sem filtro de tipo para ver o que há disponível

CONTEXTO DO BANCO:
- O banco possui principalmente CRAs (Certificados de Recebíveis do Agronegócio) e CCBs
- Alguns são pós-fixados (CDI+), outros prefixados (taxa fixa % a.a.)
- Nenhum CDB, LCI ou LCA disponível no momento

Responda sempre em português, de forma objetiva e estruturada com os dados reais do banco."""

tools = [consultar_ofertas, comparar_taxas, buscar_oferta_por_nome]
agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)


def analisar(pergunta: str) -> str:
    """
    Recebe uma pergunta e retorna análise de ofertas usando as tools disponíveis.
    """
    try:
        resultado = agent.invoke(
            {"messages": [{"role": "user", "content": pergunta}]}
        )
        return resultado["messages"][-1].content
    except Exception as e:
        logger.error(f"Erro no agente analista: {e}")
        return f"Erro ao consultar ofertas: {str(e)}"