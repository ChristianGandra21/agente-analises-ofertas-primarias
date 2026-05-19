"""
Definição do banco de dados SQLite com SQLAlchemy.

Tabelas:
    - ofertas: ofertas primárias coletadas do Meelion e CVM
    - indicadores_macro: séries do Banco Central (Selic, IPCA, câmbio)
    - contexto_noticias: artigos extraídos via Jina + LLM
"""

from datetime import datetime
from pathlib import Path

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ─── Caminho do banco ────────────────────────────────────────────────────────

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "db" / "ofertas.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

ENGINE = create_engine(f"sqlite:///{DB_PATH}", echo=False)
SessionLocal = sessionmaker(bind=ENGINE)


# ─── Base ────────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


# ─── Tabelas ─────────────────────────────────────────────────────────────────

class Oferta(Base):
    """Oferta primária de renda fixa coletada de qualquer fonte."""

    __tablename__ = "ofertas"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Identificação
    fonte = Column(String(50), nullable=False)        # "meelion", "cvm", "jina"
    instituicao = Column(String(100))                 # "BTG Pactual", "XP", ...
    emissor = Column(String(200))                     # emissor do título
    nome = Column(String(300))                        # nome completo do ativo

    # Características do ativo
    tipo = Column(String(50))                         # CDB, LCI, LCA, CRI, CRA, ...
    indexador = Column(String(50))                    # CDI, IPCA, Prefixado, Selic
    taxa_bruta = Column(String(50))                   # "12,5%" ou "CDI + 1,5%"
    taxa_valor = Column(Float)                        # valor numérico extraído da taxa
    prazo_dias = Column(Integer)                      # prazo em dias corridos
    data_vencimento = Column(String(20))              # "DD/MM/AAAA"
    com_fgc = Column(Boolean, default=False)
    isento_ir = Column(Boolean, default=False)

    # Dados da oferta (CVM)
    data_inicio = Column(String(20))
    valor_total = Column(Float)
    rito = Column(String(50))

    # Rastreabilidade
    url_detalhe = Column(Text)
    data_coleta = Column(DateTime, default=datetime.utcnow)


class IndicadorMacro(Base):
    """Série temporal de indicadores macroeconômicos do BCB."""

    __tablename__ = "indicadores_macro"

    id = Column(Integer, primary_key=True, autoincrement=True)
    serie = Column(String(50), nullable=False)   # "selic", "ipca", "usd_brl"
    codigo_bcb = Column(Integer)                 # código da série no SGS/BCB
    data = Column(String(20), nullable=False)    # "DD/MM/AAAA"
    valor = Column(Float, nullable=False)
    data_coleta = Column(DateTime, default=datetime.utcnow)


class ContextoNoticia(Base):
    """Artigo financeiro extraído via Jina + LLM."""

    __tablename__ = "contexto_noticias"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(String(20))                    # "macro", "carteira"
    instituicao = Column(String(100))            # "XP", "BTG", ...
    data_referencia = Column(String(20))         # "Maio 2026"
    fonte_url = Column(Text)
    resumo_estrategia = Column(Text)
    titulos_json = Column(Text)                  # JSON com lista de títulos
    data_coleta = Column(DateTime, default=datetime.utcnow)


# ─── Inicialização ───────────────────────────────────────────────────────────

def init_db() -> None:
    """Cria todas as tabelas se ainda não existirem."""
    Base.metadata.create_all(ENGINE)


def get_session() -> Session:
    """Retorna uma sessão do banco. Use com context manager."""
    return SessionLocal()