from langchain_groq import ChatGroq
from dotenv import load_dotenv
from loguru import logger

from src.agents.analyst import analisar
from src.agents.context import contextualizar

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

def responder(pergunta: str) -> str:
    """
    Orquestra os agentes de análise e contexto e sintetiza a resposta final.
    """
    logger.info(f"Pergunta recebida: {pergunta}")

    logger.info("Consultando agente de contexto...")
    contexto = contextualizar(pergunta)

    logger.info("Consultando agente analista...")
    analise = analisar(pergunta)

    logger.info("Sintetizando resposta final...")
    sintese = llm.invoke(
        f"""Você é um orquestrador de análise de renda fixa.
        Combine as análises abaixo numa resposta clara e coesa.

        Pergunta original: {pergunta}

        Análise de ofertas:
        {analise}

        Contexto macroeconômico:
        {contexto}

        Responda em português, de forma objetiva e estruturada."""
    )

    logger.info("Resposta final gerada.")
    return sintese.content

if __name__ == "__main__":
    while True:
        pergunta = input("\nPergunta: ").strip()
        if pergunta.lower() in ("sair", "exit", "quit"):
            break
        print("\n" + responder(pergunta))