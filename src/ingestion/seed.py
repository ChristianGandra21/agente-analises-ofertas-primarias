"""
Seed de ofertas reais baseadas em carteiras recomendadas — maio 2026.
Fonte: relatórios XP, BTG, Ágora (via Tavily/Jina).

Uso:
    python -m src.ingestion.seed
"""

from datetime import datetime
from src.database import init_db, get_session, Oferta

OFERTAS_SEED = [
    # ── BTG Pactual ──────────────────────────────────────────
    {
        "fonte": "seed", "instituicao": "BTG Pactual",
        "emissor": "Energisa Paraíba", "nome": "DEB Energisa Paraíba (SAELB7)",
        "tipo": "DEB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 7,03%", "taxa_valor": 7.03,
        "data_vencimento": "2040-10-15", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "BTG Pactual",
        "emissor": "MetrôRio", "nome": "DEB MetrôRio (MGPRA0)",
        "tipo": "DEB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 7,94%", "taxa_valor": 7.94,
        "data_vencimento": "2042-03-15", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "BTG Pactual",
        "emissor": "Eldorado Celulose", "nome": "CRA Eldorado Celulose (CRA0250080X)",
        "tipo": "CRA", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 8,09%", "taxa_valor": 8.09,
        "data_vencimento": "2035-09-17", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "BTG Pactual",
        "emissor": "3tentos", "nome": "CRA 3tentos (CRA025008N8)",
        "tipo": "CRA", "indexador": "CDI+",
        "taxa_bruta": "103% do CDI", "taxa_valor": 103.0,
        "data_vencimento": "2030-10-15", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "BTG Pactual",
        "emissor": "SLC Agrícola", "nome": "CRA SLC Agrícola (CRA025007PT)",
        "tipo": "CRA", "indexador": "CDI+",
        "taxa_bruta": "CDI + 0,65%", "taxa_valor": 0.65,
        "data_vencimento": "2033-09-22", "com_fgc": False, "isento_ir": True,
    },
    # ── XP Investimentos ─────────────────────────────────────
    {
        "fonte": "seed", "instituicao": "XP Investimentos",
        "emissor": "Banco BMG", "nome": "CDB BMG",
        "tipo": "CDB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 8,41%", "taxa_valor": 8.41,
        "data_vencimento": "2029-04-01", "com_fgc": True, "isento_ir": False,
    },
    {
        "fonte": "seed", "instituicao": "XP Investimentos",
        "emissor": "Banco Original", "nome": "LCA Original",
        "tipo": "LCA", "indexador": "CDI+",
        "taxa_bruta": "91% CDI", "taxa_valor": 91.0,
        "data_vencimento": "2029-04-01", "com_fgc": True, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "XP Investimentos",
        "emissor": "Banco C6", "nome": "CDB C6",
        "tipo": "CDB", "indexador": "Prefixado",
        "taxa_bruta": "14,35% a.a.", "taxa_valor": 14.35,
        "data_vencimento": "2030-04-01", "com_fgc": True, "isento_ir": False,
    },
    {
        "fonte": "seed", "instituicao": "XP Investimentos",
        "emissor": "Marfrig", "nome": "CRA Marfrig (CRA024002ML)",
        "tipo": "CRA", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 9,40%", "taxa_valor": 9.40,
        "data_vencimento": "2034-03-01", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "XP Investimentos",
        "emissor": "Isa Energia", "nome": "Debênture TRPLA7",
        "tipo": "DEB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 6,65%", "taxa_valor": 6.65,
        "data_vencimento": "2036-10-01", "com_fgc": False, "isento_ir": True,
    },
    # ── Ágora ────────────────────────────────────────────────
    {
        "fonte": "seed", "instituicao": "Ágora",
        "emissor": "Eldorado Brasil", "nome": "CRA Eldorado Brasil (CRA025007KK)",
        "tipo": "CRA", "indexador": "Prefixado",
        "taxa_bruta": "13,57% a.a.", "taxa_valor": 13.57,
        "data_vencimento": "2032-09-01", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "Ágora",
        "emissor": "Energisa", "nome": "Debênture ENGIB2",
        "tipo": "DEB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 6,76%", "taxa_valor": 6.76,
        "data_vencimento": "2034-09-01", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "Ágora",
        "emissor": "Sabesp", "nome": "Debênture SBSPF3",
        "tipo": "DEB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 6,75%", "taxa_valor": 6.75,
        "data_vencimento": "2040-01-01", "com_fgc": False, "isento_ir": True,
    },
    {
        "fonte": "seed", "instituicao": "Ágora",
        "emissor": "Even Construtora", "nome": "CRI Even (25L2997442)",
        "tipo": "CRI", "indexador": "CDI+",
        "taxa_bruta": "100% CDI", "taxa_valor": 100.0,
        "data_vencimento": "2032-12-01", "com_fgc": False, "isento_ir": True,
    },
    # ── Itaú BBA ─────────────────────────────────────────────
    {
        "fonte": "seed", "instituicao": "Itaú BBA",
        "emissor": "Ecorodovias", "nome": "Debênture ERDVB4",
        "tipo": "DEB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 7,16%", "taxa_valor": 7.16,
        "data_vencimento": "2034-06-01", "com_fgc": False, "isento_ir": True,
    },
    # ── Genial ───────────────────────────────────────────────
    {
        "fonte": "seed", "instituicao": "Genial",
        "emissor": "Vero", "nome": "DEB Vero (VERO15)",
        "tipo": "DEB", "indexador": "Prefixado",
        "taxa_bruta": "14,83% a.a.", "taxa_valor": 14.83,
        "data_vencimento": "2032-07-15", "com_fgc": False, "isento_ir": False,
    },
    {
        "fonte": "seed", "instituicao": "Genial",
        "emissor": "Rialma Energia", "nome": "DEB Rialma Energia (RALM11)",
        "tipo": "DEB", "indexador": "IPCA+",
        "taxa_bruta": "IPCA + 7,59%", "taxa_valor": 7.59,
        "data_vencimento": "2046-12-15", "com_fgc": False, "isento_ir": True,
    },
]


def seed():
    init_db()
    inseridos = 0

    with get_session() as session:
        deleted = session.query(Oferta).filter_by(fonte="seed").delete()
        if deleted:
            print(f"  → {deleted} seeds anteriores removidos")

        for data in OFERTAS_SEED:
            oferta = Oferta(
                **data,
                data_coleta=datetime.utcnow(),
            )
            session.add(oferta)
            inseridos += 1

        session.commit()

    print(f"✓ {inseridos} ofertas seed inseridas no banco")
    return inseridos


if __name__ == "__main__":
    seed()
