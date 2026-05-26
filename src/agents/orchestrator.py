import concurrent.futures
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv
from loguru import logger

from src.agents.analyst import analisar
from src.agents.context import contextualizar

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

SYSTEM_SINTESE = """Você é um orquestrador de análise de investimentos em renda fixa brasileira.

Sua tarefa é sintetizar as análises de dois sub-agentes em uma resposta clara, completa e acionável.

REGRAS:
1. Combine as informações de forma coesa — não repita dados
2. Se a análise de ofertas trouxer dados reais (ativos, taxas), destaque-os com clareza
3. Contextualize com os dados macro (Selic, IPCA) quando relevante
4. Se um sub-agente reportou erro ou falta de dados, seja transparente mas foque no que há disponível
5. Nunca invente dados — use apenas o que os sub-agentes retornaram
6. Responda em português, de forma estruturada (use markdown com **negrito** e listas quando adequado)
7. Inclua sempre: o que foi encontrado no banco, taxa(s), vencimento(s), e recomendação contextualizada"""


def responder(pergunta: str) -> str:
    """
    Orquestra os agentes de análise e contexto e sintetiza a resposta final.
    """
    logger.info(f"Pergunta recebida: {pergunta}")

    logger.info("Consultando agente analista (ofertas)...")
    analise = analisar(pergunta)
    logger.debug(f"Analise: {analise[:200]}...")

    logger.info("Consultando agente de contexto (macro)...")
    contexto = "Contexto macroecon\u00f4mico indispon\u00edvel no momento."
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(contextualizar, pergunta)
            contexto = future.result(timeout=20)
        logger.debug(f"Contexto: {contexto[:200]}...")
    except concurrent.futures.TimeoutError:
        logger.warning("Agente de contexto excedeu timeout de 20s — continuando sem contexto macro")
    except Exception as e:
        logger.error(f"Erro no agente de contexto: {e}")

    logger.info("Sintetizando resposta final...")
    try:
        mensagens = [
            SystemMessage(content=SYSTEM_SINTESE),
            HumanMessage(content=f"""Pergunta do usuário: {pergunta}

=== ANÁLISE DE OFERTAS (sub-agente analista) ===
{analise}

=== CONTEXTO MACROECONÔMICO (sub-agente contextualista) ===
{contexto}

Sintetize as informações acima em uma resposta completa e objetiva para o usuário."""),
        ]
        sintese = llm.invoke(mensagens)
        resposta = sintese.content
    except Exception as e:
        logger.error(f"Erro na síntese final: {e}")
        # Fallback: retorna a análise diretamente
        resposta = analise

    logger.info("Resposta final gerada.")
    return resposta


if __name__ == "__main__":
    while True:
        pergunta = input("\nPergunta: ").strip()
        if pergunta.lower() in ("sair", "exit", "quit"):
            break
        print("\n" + responder(pergunta))