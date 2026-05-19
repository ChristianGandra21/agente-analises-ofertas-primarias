from playwright.sync_api import sync_playwright, Page
from loguru import logger
from datetime import datetime

from requests import session

from src.database import Oferta, get_session, init_db

URL_LISTAGEM = "https://www.meelion.com/renda-fixa/comparar-investimentos/"

def parse_cards(page: Page):
    cards = page.query_selector_all(".investment-card.h-100")
    ofertas = []
    for card in cards:
        badge = card.query_selector(".badge")
        tipo = badge.inner_text().strip() if badge else None

        link_el = card.query_selector(".title-text a")
        nome = link_el.inner_text().strip() if link_el else None
        href = link_el.get_attribute("href") if link_el else None
        url_detalhe = f"https://www.meelion.com{href}" if href else None

        fgc_el = card.query_selector(".ci-card-fgc-pill")
        com_fgc = False
        if fgc_el:
            com_fgc = "sem fgc" not in fgc_el.inner_text().lower()

        info = {}
        for item in card.query_selector_all(".info-item"):
            label_el = item.query_selector(".label")
            value_el = item.query_selector(".value")
            if label_el and value_el:
                info[label_el.inner_text().strip()] = value_el.inner_text().strip()

        emissor = info.get("Oferecido por")
        distribuidor = info.get("Diponível")
        
        ofertas.append({
            "nome": nome,
            "tipo": tipo,
            "com_fgc": com_fgc,
            "emissor": emissor,
            "distribuidor": distribuidor,
            "url_detalhe": url_detalhe,
        })

    return ofertas

def get_dd(page, label: str) -> str | None:
    dt = page.query_selector(f"dt:has-text('{label}')")
    if not dt:
        return None
    dd = dt.evaluate("el => el.nextElementSibling")
    return dd.get("innerText", "").strip() if dd else None

def fetch_detalhe(page: Page, url: str) -> dict:
    page.goto(url, wait_until="networkidle", timeout=15000)

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
        browser = p.firefox.launch(headless=False)
        page = browser.new_page()

        page.goto(URL_LISTAGEM, wait_until="networkidle", timeout=15000)
        ofertas = parse_cards(page)
        logger.info(f"{len(ofertas)} ofertas encontradas na listagem")

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

            existe = get_session().query(Oferta).filter_by(
                emissor=oferta["emissor"],
                data_inicio=None,
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

if __name__ == "__main__":
    coletar()
    