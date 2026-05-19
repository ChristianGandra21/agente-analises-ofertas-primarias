"""
Extração estruturada de carteiras de renda fixa de artigos financeiros.

Fluxo:
  1. Fetch do artigo via r.jina.ai (HTML → markdown limpo)
  2. Extração estruturada com Pydantic + LangChain (with_structured_output)
  3. Persistência no banco na tabela contexto_noticias

Uso:
    python -m src.ingestion.extract_renda_fixa
"""

import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from loguru import logger
from pydantic import BaseModel, Field

from src.database import ContextoNoticia, get_session, init_db

load_dotenv()

# ─── URLs ─────────────────────────────────────────────────────────────────────

URLS = [
    # XP — carteira renda fixa maio 2026 (já tem)
    "https://www.moneytimes.com.br/ipca1098-confira-os-titulos-de-renda-fixa-recomendados-pela-xp-para-maio-jcav/",
    
    # XP + Ágora + BTG — 14 papéis recomendados maio 2026
    "https://www.infomoney.com.br/onde-investir/onde-investir-na-renda-fixa-em-maio-veja-14-papeis-recomendados-para-o-mes/",
    
    # XP, Guide e Genial — comparativo de recomendações
    "https://maisretorno.com/portal/renda-fixa-confira-recomendacoes-de-guide-xp-e-genial-para-investir",
    
    # BTG — carteiras de abril com IPCA+ e prefixados
    "https://www.seudinheiro.com/2026/renda-fixa/alem-do-tesouro-selic-e-do-cdi-recomendacoes-de-renda-fixa-para-abril-reafirmam-atratividade-de-titulos-ipca-mlim/",
    
    # BTG — onde investir em renda fixa 2026
    "https://content.btgpactual.com/blog/investimentos/onde-investir-em-renda-fixa-em-2026-as-melhores-oportunidades-para-o-ano",
]

# ─── Schema Pydantic ──────────────────────────────────────────────────────────


class TituloRendaFixa(BaseModel):
    ativo_emissor: str = Field(description="Nome do ativo ou emissor (ex: CDB BMG, NTN-B, CRA Marfrig)")
    vencimento: str = Field(description="Data de vencimento no formato DD/MM/AAAA")
    indexador: str = Field(description="Tipo de indexador: Prefixado, %CDI, %Selic, IPCA+, etc.")
    duration_anos: float | None = Field(default=None, description="Duration em anos, se disponível")
    ticker: str | None = Field(default=None, description="Ticker/código do ativo na bolsa, se disponível")
    taxa_bruta: str = Field(description="Taxa bruta indicativa (ex: IPCA + 8,41%, 14,35%, 91% CDI)")
    isento_ir: bool = Field(description="Se o título é isento de Imposto de Renda")
    taxa_gross_up: str | None = Field(default=None, description="Taxa equivalente gross-up (para isentos), se disponível")
    observacao: str | None = Field(default=None, description="Observação adicional sobre o título, se houver no texto")


class CarteiraRecomendada(BaseModel):
    instituicao: str = Field(description="Nome da instituição que fez a recomendação (ex: XP, BTG, Itaú)")
    data_referencia: str = Field(description="Mês/ano de referência da recomendação (ex: Maio 2026)")
    fonte_url: str = Field(description="URL da fonte original")
    resumo_estrategia: str = Field(description="Breve resumo da estratégia/macro descrita no artigo")
    titulos: list[TituloRendaFixa] = Field(description="Lista de títulos recomendados na carteira")


# ─── Fetch via r.jina.ai ──────────────────────────────────────────────────────


def fetch_page(url: str) -> str:
    logger.info(f"Buscando página via r.jina.ai: {url}")
    jina_url = f"https://r.jina.ai/{url}"
    resp = requests.get(jina_url, headers={"Accept": "text/plain"}, timeout=30)
    resp.raise_for_status()
    content = resp.text
    logger.success(f"  → {len(content):,} caracteres obtidos")
    return content


# ─── Extração com LangChain + LLM ─────────────────────────────────────────────


def extract_from_text(content: str, source_url: str) -> CarteiraRecomendada:
    model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
    structured_model = model.with_structured_output(CarteiraRecomendada)

    prompt = f"""Você é um analista financeiro especializado em extrair informações de títulos de renda fixa de artigos e carteiras recomendadas.

Extraia TODOS os títulos de renda fixa mencionados no texto abaixo e retorne no formato estruturado solicitado.

Regras:
- Extraia cada título da tabela ou lista mencionada
- Para taxa_bruta, use exatamente o formato que aparece (ex: "IPCA + 8,41%", "14,35%", "91% CDI")
- isento_ir deve ser True se o artigo mencionar isenção de IR para aquele título
- taxa_gross_up é a taxa equivalente para títulos isentos (quando mencionada)
- Preencha instituicao com o nome da casa que recomendou (ex: "XP Investimentos")
- data_referencia é o mês/ano da recomendação mencionado no artigo
- resumo_estrategia é um breve resumo (2-3 frases) da estratégia macro descrita
- Se algum campo não estiver disponível, use null

Texto do artigo:
---
{content}
---

URL da fonte: {source_url}"""

    return structured_model.invoke(prompt)


# ─── Persistência ─────────────────────────────────────────────────────────────


def salvar_carteira(carteira: CarteiraRecomendada) -> bool:
    with get_session() as session:
        existe = session.query(ContextoNoticia).filter_by(
            fonte_url=carteira.fonte_url,
            tipo="carteira",
        ).first()

        if existe:
            logger.info(f"  → Carteira já existe no banco, ignorando")
            return False

        noticia = ContextoNoticia(
            tipo="carteira",
            instituicao=carteira.instituicao,
            data_referencia=carteira.data_referencia,
            fonte_url=carteira.fonte_url,
            resumo_estrategia=carteira.resumo_estrategia,
            titulos_json=json.dumps(
                [t.model_dump(mode="json") for t in carteira.titulos],
                ensure_ascii=False,
            ),
        )
        session.add(noticia)
        session.commit()

    logger.success(f"  → Carteira '{carteira.instituicao}' salva ({len(carteira.titulos)} títulos)")
    return True


# ─── Exibição ─────────────────────────────────────────────────────────────────


def exibir_carteira(carteira: CarteiraRecomendada):
    logger.info(f"Carteira recomendada — {carteira.instituicao}")
    logger.info(f"  Referência: {carteira.data_referencia}")
    logger.info(f"  Fonte: {carteira.fonte_url}")
    logger.info(f"  Estratégia: {carteira.resumo_estrategia[:200]}...")
    logger.info(f"  {len(carteira.titulos)} títulos encontrados:")

    for i, t in enumerate(carteira.titulos, 1):
        ir = " [ISENTO]" if t.isento_ir else ""
        logger.info(f"    {i:2d}. {t.ativo_emissor}{ir}")
        logger.info(f"        Venc: {t.vencimento} | {t.indexador} | {t.taxa_bruta}")


# ─── Main ─────────────────────────────────────────────────────────────────────


def main():
    if not os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API_KEY") == "sua_chave_aqui":
        logger.error("GROQ_API_KEY não configurada. Defina uma chave válida no .env")
        return

    init_db()
    total_titulos = 0

    for url in URLS:
        try:
            content = fetch_page(url)
            carteira = extract_from_text(content, url)
            exibir_carteira(carteira)
            if salvar_carteira(carteira):
                total_titulos += len(carteira.titulos)
        except Exception as e:
            logger.error(f"Erro ao processar {url}: {e}")

    logger.success(f"Total: {total_titulos} títulos extraídos e salvos")


if __name__ == "__main__":
    main()
