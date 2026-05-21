"""
Scraper de ofertas de renda fixa — Meelion (comparar investimentos).

Extrai cards da listagem, navega no detalhe de cada oferta
e persiste no banco de dados.

Uso:
    python -m src.ingestion.meelion
"""

from playwright.sync_api import sync_playwright, Page
from loguru import logger
from datetime import datetime

from src.database import Oferta, get_session, init_db

URL_LISTAGEM = "https://www.meelion.com/renda-fixa/comparar-investimentos/"

# Tipos de produto conhecidos na renda fixa
TIPOS_CONHECIDOS = {"CRA", "CDB", "CRI", "LCI", "LCA", "LC", "LF", "DEBENTURE", "DEBENTURES", "CCP", "FIDC", "CCB", "NC"}


def extrair_tipo(nome: str | None, href: str | None) -> str | None:
    """Extrai o tipo do produto (CRA, CDB, LCI…) a partir do nome ou do href."""
    if nome:
        primeira_palavra = nome.split()[0].upper() if nome.split() else ""
        if primeira_palavra in TIPOS_CONHECIDOS:
            return primeira_palavra
    if href:
        slug = href.strip("/").split("/")[-1]  # ex: cra-fs-florestal-cdi-...
        prefixo = slug.split("-")[0].upper()   # ex: CRA
        if prefixo in TIPOS_CONHECIDOS:
            return prefixo
    return None


def parse_cards(page: Page):
    cards = page.query_selector_all(".investment-card.h-100")
    ofertas = []
    for card in cards:
        # Nota: .badge retorna o indexador (PÓS-FIXADO/PRÉ-FIXADO), não o tipo.
        # O tipo (CRA, CDB, LCI…) é extraído do nome do investimento ou do href.

        link_el = card.query_selector(".title-text a")
        nome = link_el.inner_text().strip() if link_el else None
        href = link_el.get_attribute("href") if link_el else None
        url_detalhe = f"https://www.meelion.com{href}" if href else None
        tipo = extrair_tipo(nome, href)

        fgc_el = card.query_selector(".ci-card-fgc-pill")
        fgc_texto = fgc_el.inner_text().strip() if fgc_el else None
        com_fgc = fgc_texto is not None and "sem fgc" not in fgc_texto.lower()

        info = {}
        for item in card.query_selector_all(".info-item"):
            label_el = item.query_selector(".label")
            value_el = item.query_selector(".value")
            if label_el and value_el:
                label = label_el.inner_text().strip().rstrip(":")
                info[label] = value_el.inner_text().strip()

        ofertas.append({
            "nome": nome,
            "tipo": tipo,
            "com_fgc": com_fgc,
            "emissor": info.get("Oferecido por"),
            "distribuidor": info.get("Disponível"),
            "url_detalhe": url_detalhe,
            "isento_ir": info.get("Impostos") == "ISENTO",
            "data_vencimento": info.get("Vencimento"),
        })

    return ofertas

def get_dd(page, label: str) -> str | None:
    dd = page.query_selector(f"dt:has-text('{label}') + dd")
    return dd.inner_text().strip() if dd else None

def fetch_detalhe(page: Page, url: str) -> dict:
    page.goto(url, wait_until="domcontentloaded", timeout=20000)
    page.wait_for_timeout(1000)

    taxa_el = page.query_selector(".meelion-painel-estrategia-pill .ml-1")
    taxa_bruta = taxa_el.inner_text().strip() if taxa_el else None

    return {
        "taxa_bruta": taxa_bruta,
        "data_vencimento": get_dd(page, "Vencimento"),
        "isento_ir": get_dd(page, "Imposto de Renda") == "Isento",
        "rentabilidade_bruta": get_dd(page, "Rentabilidade Bruta"),
    }

def coletar():
    init_db()
    inseridos = 0

    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        page = browser.new_page()

        page.goto(URL_LISTAGEM, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(2000)
        ofertas = parse_cards(page)
        logger.info(f"{len(ofertas)} ofertas encontradas na listagem")

        with get_session() as session:
            for oferta in ofertas:
                if not oferta["url_detalhe"]:
                    logger.warning(f"  → Oferta '{oferta['nome']}' sem URL de detalhe, pulando")
                    continue

                try:
                    detalhe = fetch_detalhe(page, oferta["url_detalhe"])
                    oferta.update(detalhe)
                except Exception as e:
                    logger.error(f"  → Erro ao coletar detalhe de '{oferta['nome']}': {e}")
                    continue

                existe = session.query(Oferta).filter_by(
                    nome=oferta["nome"],
                ).first()

                if existe:
                    logger.info(f"  → Oferta '{oferta['nome']}' já existe no banco, ignorando")
                    continue

                nova_oferta = Oferta(
                    fonte="meelion",
                    nome=oferta["nome"],
                    tipo=oferta["tipo"],
                    com_fgc=oferta["com_fgc"],
                    emissor=oferta["emissor"],
                    instituicao=oferta["distribuidor"],
                    taxa_bruta=oferta.get("taxa_bruta"),
                    data_vencimento=oferta.get("data_vencimento"),
                    isento_ir=oferta.get("isento_ir", False),
                    url_detalhe=oferta["url_detalhe"],
                )
                session.add(nova_oferta)
                inseridos += 1
                logger.info(f"  → Oferta '{oferta['nome']}' inserida no banco")

            session.commit()
            logger.success(f"Total de {inseridos} ofertas inseridas")

if __name__ == "__main__":
    coletar()
    