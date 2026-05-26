import re
from langchain_core.tools import tool
from src.database import get_session, Oferta
from sqlalchemy import or_, case


def _extrair_indexador_texto(taxa_bruta: str | None) -> str | None:
    """Deriva indexador do texto da taxa bruta."""
    if not taxa_bruta:
        return None
    upper = taxa_bruta.upper()
    if "CDI" in upper:
        return "CDI+"
    if "IPCA" in upper:
        return "IPCA+"
    if "SELIC" in upper:
        return "Selic"
    if re.search(r"\d+[.,]\d+\s*%", upper):
        return "Prefixado"
    return None


def _formatar_oferta(o: Oferta) -> str:
    """Formata uma oferta em texto legível para o LLM."""
    indexador = o.indexador or _extrair_indexador_texto(o.taxa_bruta) or "N/D"
    return (
        f"[{o.tipo or 'N/D'}] {o.nome or o.emissor or 'Sem nome'} "
        f"| Emissor: {o.emissor or 'N/D'} "
        f"| Distribuidor: {o.instituicao or 'N/D'} "
        f"| Indexador: {indexador} "
        f"| Taxa: {o.taxa_bruta or 'N/D'}"
        + (f" ({o.taxa_valor:.2f}% a.a.)" if o.taxa_valor else "")
        + f" | Venc: {o.data_vencimento or 'N/D'}"
        f" | FGC: {'Sim' if o.com_fgc else 'Não'}"
        f" | IR: {'Isento' if o.isento_ir else 'Tributado'}"
    )


@tool
def buscar_oferta_por_nome(nome: str) -> str:
    """
    Busca uma oferta específica pelo nome do ativo, emissor ou parte do nome.
    Use quando o usuário mencionar um ativo específico como 'CRA FS BIO', 'CCB Allu' ou qualquer nome parcial.
    """
    with get_session() as session:
        ofertas = (
            session.query(Oferta)
            .filter(
                or_(
                    Oferta.nome.ilike(f"%{nome}%"),
                    Oferta.emissor.ilike(f"%{nome}%"),
                )
            )
            .order_by(Oferta.taxa_valor.desc().nullslast())
            .limit(5)
            .all()
        )

        if not ofertas:
            return f"Nenhuma oferta encontrada para '{nome}'."

        return "\n\n".join(_formatar_oferta(o) for o in ofertas)


@tool
def consultar_ofertas(
    tipo: str = "",
    indexador: str = "",
    instituicao: str = "",
    nome_busca: str = "",
) -> str:
    """
    Consulta ofertas primárias de renda fixa no banco de dados.

    Use para buscar e comparar ofertas filtradas. Os dados disponíveis no banco são principalmente
    CRAs (Certificados de Recebíveis do Agronegócio) e CCBs (Cédulas de Crédito Bancário).

    Parâmetros:
    - tipo: tipo do ativo. Ex: 'CRA', 'CCB', 'CDB', 'CRI', 'LCI', 'LCA'
    - indexador: 'CDI', 'IPCA', 'Prefixado', 'Selic'
    - instituicao: nome da instituição distribuidora. Ex: 'XP', 'BTG', 'MOVA'
    - nome_busca: busca livre no nome do ativo ou emissor

    IMPORTANTE: Se não houver resultados com filtros específicos, tente com menos filtros ou nome_busca vazio.
    """
    with get_session() as session:
        query = session.query(Oferta)

        # Filtro de taxa_bruta presente (tem informação de taxa)
        query = query.filter(Oferta.taxa_bruta.isnot(None))

        if tipo:
            query = query.filter(
                or_(
                    Oferta.tipo.ilike(f"%{tipo}%"),
                    Oferta.nome.ilike(f"%{tipo}%"),
                )
            )
        if indexador:
            idx_map = {"CDI": "CDI", "IPCA": "IPCA", "SELIC": "Selic", "PREFIXADO": "Prefixado"}
            idx_norm = idx_map.get(indexador.upper(), indexador)
            query = query.filter(
                or_(
                    Oferta.indexador.ilike(f"%{idx_norm}%"),
                    Oferta.taxa_bruta.ilike(f"%{indexador}%"),
                )
            )
        if instituicao:
            query = query.filter(Oferta.instituicao.ilike(f"%{instituicao}%"))
        if nome_busca:
            query = query.filter(
                or_(
                    Oferta.nome.ilike(f"%{nome_busca}%"),
                    Oferta.emissor.ilike(f"%{nome_busca}%"),
                )
            )

        # Ordena: com taxa_valor primeiro (desc), depois sem taxa_valor
        query = query.order_by(
            Oferta.taxa_valor.desc().nullslast(),
            Oferta.id.desc(),
        )
        ofertas = query.limit(15).all()

        if not ofertas:
            filtros_usados = []
            if tipo:
                filtros_usados.append(f"tipo='{tipo}'")
            if indexador:
                filtros_usados.append(f"indexador='{indexador}'")
            if instituicao:
                filtros_usados.append(f"instituição='{instituicao}'")
            if nome_busca:
                filtros_usados.append(f"nome='{nome_busca}'")
            desc = ", ".join(filtros_usados) if filtros_usados else "sem filtro"
            return (
                f"Nenhuma oferta encontrada com os critérios: {desc}. "
                f"O banco de dados possui atualmente CRAs (pós-fixados CDI+ e prefixados) e CCBs. "
                f"Tente buscar sem filtros ou com tipo='CRA'."
            )

        linhas = [f"Encontradas {len(ofertas)} oferta(s):\n"]
        linhas.extend(_formatar_oferta(o) for o in ofertas)
        return "\n".join(linhas)


@tool
def comparar_taxas(ativo_a: str, ativo_b: str) -> str:
    """
    Compara as taxas de dois ativos e calcula o spread entre eles.
    Use quando o usuário quiser saber a diferença de rentabilidade entre dois investimentos.
    Exemplos: ativo_a='CRA FS BIO', ativo_b='CRA FS FLORESTAL'
    """
    with get_session() as session:
        a = (
            session.query(Oferta)
            .filter(
                or_(
                    Oferta.nome.ilike(f"%{ativo_a}%"),
                    Oferta.emissor.ilike(f"%{ativo_a}%"),
                )
            )
            .order_by(Oferta.taxa_valor.desc().nullslast())
            .first()
        )
        b = (
            session.query(Oferta)
            .filter(
                or_(
                    Oferta.nome.ilike(f"%{ativo_b}%"),
                    Oferta.emissor.ilike(f"%{ativo_b}%"),
                )
            )
            .order_by(Oferta.taxa_valor.desc().nullslast())
            .first()
        )

        if not a:
            return f"Ativo '{ativo_a}' não encontrado no banco de dados."
        if not b:
            return f"Ativo '{ativo_b}' não encontrado no banco de dados."

        nome_a = a.nome or a.emissor or "Ativo A"
        nome_b = b.nome or b.emissor or "Ativo B"

        if a.taxa_valor is None or b.taxa_valor is None:
            return (
                f"{nome_a}: {a.taxa_bruta or 'taxa indisponível'}\n"
                f"{nome_b}: {b.taxa_bruta or 'taxa indisponível'}\n"
                f"Spread numérico não calculável — taxa_valor ausente."
            )

        spread = a.taxa_valor - b.taxa_valor
        vencedor = nome_a if spread > 0 else nome_b if spread < 0 else "Empate"
        return (
            f"{nome_a}: {a.taxa_bruta} ({a.taxa_valor:.2f}% a.a.)\n"
            f"{nome_b}: {b.taxa_bruta} ({b.taxa_valor:.2f}% a.a.)\n"
            f"Spread: {abs(spread):.2f} pp | Melhor taxa: {vencedor}"
        )