from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from loguru import logger
from dotenv import load_dotenv
import os

from src.database import get_session, Oferta, IndicadorMacro, ContextoNoticia

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

def consultar_macro() -> str:
    """
    Retorna os últimos valores de Selic, IPCA e câmbio USD/BRL.
    Use quando precisar de contexto macroeconômico para explicar variações de taxa.
    """
    