"""
Download e análise dos dados de Ofertas Públicas de Distribuição da CVM.

Fonte: https://dados.cvm.gov.br/dataset/oferta-distrib

Contém dois arquivos CSV dentro de um ZIP:
  1. oferta_distribuicao.csv — Histórico completo (1988–hoje)
     Ofertas registradas/dispensadas: ICVM 400, RCVM 160, ICVM 476, ICVM 555

  2. oferta_resolucao_160.csv — Rito automático (2023–hoje)
     Ofertas sob Resolução CVM 160 com dados detalhados de coordinadores,
     público-alvo, regime de distribuição, etc.

Relevância para o projeto:
  - Base oficial e obrigatória de TODAS as ofertas públicas no Brasil
  - Contém emissor, instituição líder/coordenadora, tipo de ativo, volume, datas
  - Permite análise comparativa entre instituições (BTG, XP, Itaú, etc.)
  - Dados atualizados diariamente pela CVM
"""

import os
import requests
from loguru import logger
import pandas as pd
from io import BytesIO
from zipfile import ZipFile
from pathlib import Path

from src.database import init_db, get_session, Oferta

# ─── Configurações ───────────────────────────────────────────────────────────

CVM_BASE_URL = "https://dados.cvm.gov.br/dados/OFERTA/DISTRIB/DADOS"
ZIP_URL = f"{CVM_BASE_URL}/oferta_distribuicao.zip"
DATA_DIR = Path("data/cvm")

FILES = {
    "oferta_distribuicao": {
        "csv_index": 0,
        "description": "Histórico completo (1988–hoje) — ICVM 400, RCVM 160, ICVM 476, ICVM 555",
    },
    "oferta_resolucao_160": {
        "csv_index": 1,
        "description": "Rito automático (2023–hoje) — Resolução CVM 160",
    },
}

# ───  Download zip ──────────────────────────────────────────────────────────────

def download_zip(url: str) -> BytesIO:
    logger.info(f"Baixando ZIP da CVM: {url}")
    resp = requests.get(url, stream=True, timeout=30)
    resp.raise_for_status()

    buffer = BytesIO()
    for chunk in resp.iter_content(chunk_size=8192):
        buffer.write(chunk)

    buffer.seek(0)
    logger.success(f"Download concluído ({buffer.getbuffer().nbytes / 1024:.0f} KB)")
    return buffer

# ─── Extração dos CSVs ────────────────────────────────────────────────────────────────

def extrair_csvs(buffer: BytesIO) -> dict[str, pd.DataFrame]:
    dados = {}

    with ZipFile(buffer) as zip_file:
        logger.info(f"Conteúdo do ZIP: {zip_file.namelist()}")
        for nome, config in FILES.items():
            csv_name = zip_file.namelist()[config["csv_index"]]
            logger.info(f"Lendo {config['description']} do arquivo {csv_name}...")
            with zip_file.open(csv_name) as csv_file:
                dados[nome] = pd.read_csv(csv_file, sep=";", encoding="latin1", low_memory=False)
            logger.success(f"  → {len(dados[nome])} registros carregados")

    return dados

# ─── Normalização e limpeza ────────────────────────────────────────────────────────────────

COLUNAS_RELEVANTES = [
    "Nome_Emissor",
    "Nome_Lider",
    "Tipo_Ativo",
    "Atualizacao_Monetaria",
    "Juros",
    "Data_Inicio_Oferta",
    "Data_Vencimento",
    "Valor_Total",
    "Oferta_Incentivo_Fiscal",
    "Rito_Oferta",
]

RENOMEAR_COLUNAS = {
    "Nome_Emissor": "emissor",
    "Nome_Lider": "instituicao",
    "Tipo_Ativo": "tipo",
    "Atualizacao_Monetaria": "indexador",
    "Juros": "taxa_bruta",
    "Data_Inicio_Oferta": "data_inicio",
    "Data_Vencimento": "data_vencimento",
    "Valor_Total": "valor_total",
    "Oferta_Incentivo_Fiscal": "isento_ir",
    "Rito_Oferta": "rito",
}


def normalizar(dfs: dict[str, pd.DataFrame]) -> pd.DataFrame:
    df = dfs["oferta_distribuicao"].copy()

    df = df[COLUNAS_RELEVANTES]

    df = df.dropna(subset=["Nome_Emissor", "Tipo_Ativo"])

    df["Tipo_Ativo"] = (
        df["Tipo_Ativo"]
        .str.strip()
        .str.normalize("NFKD")
        .str.encode("ascii", errors="ignore")
        .str.decode("utf-8")
        .str.upper()
    )

    df = df.rename(columns=RENOMEAR_COLUNAS)

    df["isento_ir"] = df["isento_ir"].str.strip().str.upper() == "S"

    df = df.reset_index(drop=True)

    return df
    
# ─── Salvar no banco de dados ────────────────────────────────────────────────────────────────

def salvar_ofertas(df: pd.DataFrame) -> int:
    inseridos = 0
    total = len(df)
    logger.info(f"Salvando {total} ofertas no banco de dados...")

    with get_session() as session:
        existentes = {
            (r.emissor, r.data_inicio)
            for r in session.query(Oferta.emissor, Oferta.data_inicio).filter(
                Oferta.fonte == "cvm"
            ).all()
        }
        logger.info(f"  → {len(existentes)} registros já existentes no banco")

        novas = []
        for _, row in df.iterrows():
            chave = (row["emissor"], row["data_inicio"])
            if chave in existentes:
                continue

            valor = row["valor_total"]
            valor = None if pd.isna(valor) else float(valor)

            novas.append(Oferta(
                fonte="cvm",
                emissor=row["emissor"],
                instituicao=row["instituicao"],
                tipo=row["tipo"],
                indexador=row["indexador"],
                taxa_bruta=row["taxa_bruta"],
                taxa_valor=None,
                data_inicio=row["data_inicio"],
                data_vencimento=row["data_vencimento"],
                valor_total=valor,
                isento_ir=row["isento_ir"],
                rito=row["rito"],
            ))

        if novas:
            session.add_all(novas)
            session.commit()
            inseridos = len(novas)

        logger.success(f"  → {inseridos} novas ofertas inseridas ({total - inseridos} duplicatas ignoradas)")

    return inseridos

# ─── Main ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    os.makedirs(DATA_DIR, exist_ok=True)

    buffer = download_zip(ZIP_URL)
    dfs = extrair_csvs(buffer)
    df_normalizado = normalizar(dfs)

    inseridos = salvar_ofertas(df_normalizado)
    logger.success(f"Total de ofertas inseridas: {inseridos}")
