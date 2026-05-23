from langchain_core.tools import tool
from src.database import get_session, Oferta


@tool
def buscar_oferta_por_nome(nome: str) -> str:
    """
    Busca uma oferta específica pelo nome do ativo ou emissor.
    Use quando o usuário mencionar um ativo específico como 'CDB C6' ou 'CRA Marfrig'.
    """
    with get_session() as session:
        ofertas = (
            session.query(Oferta)
            .filter(
                (Oferta.nome.ilike(f"%{nome}%")) |
                (Oferta.emissor.ilike(f"%{nome}%"))
            )
            .limit(5)
            .all()
        )

        if not ofertas:
            return f"Nenhuma oferta encontrada para '{nome}'."

        resultado = []
        for o in ofertas:
            resultado.append(
                f"{o.nome or o.emissor} ({o.instituicao})\n"
                f"  Tipo: {o.tipo} | Indexador: {o.indexador}\n"
                f"  Taxa: {o.taxa_bruta} | Vencimento: {o.data_vencimento}\n"
                f"  FGC: {'Sim' if o.com_fgc else 'Não'} | IR: {'Isento' if o.isento_ir else 'Tributado'}"
            )
        return "\n\n".join(resultado)


@tool
def consultar_ofertas(
    tipo: str = "",
    indexador: str = "",
    instituicao: str = ""
) -> str:
    """
    Consulta ofertas primárias de renda fixa no banco de dados.
    Use para buscar e comparar ofertas por tipo de ativo, indexador ou instituição.
    Exemplos: tipo='CDB', indexador='IPCA', instituicao='BTG'
    """
    with get_session() as session:
        query = session.query(Oferta)

        # Apenas ofertas com taxa por padrão
        query = query.filter(Oferta.taxa_bruta.isnot(None))

        if tipo:
            query = query.filter(Oferta.tipo.ilike(f"%{tipo}%"))
        if indexador:
            query = query.filter(Oferta.indexador.ilike(f"%{indexador}%"))
        if instituicao:
            query = query.filter(Oferta.instituicao.ilike(f"%{instituicao}%"))

        ofertas = query.limit(20).all()

        if not ofertas:
            filtros = []
            if tipo:
                filtros.append(f"tipo='{tipo}'")
            if indexador:
                filtros.append(f"indexador='{indexador}'")
            if instituicao:
                filtros.append(f"instituicao='{instituicao}'")
            desc = ", ".join(filtros) if filtros else "sem filtro"
            return (
                f"RESULTADO: Nenhuma oferta encontrada no banco de dados com os critérios: {desc}. "
                f"NÃO sugira alternativas nem invente dados — informe ao usuário que não há ofertas "
                f"do tipo solicitado na base atual."
            )

        resultado = []
        for oferta in ofertas:
            linha = (
                f"[TIPO: {oferta.tipo or 'N/D'}] "
                f"{oferta.nome} | "
                f"Indexador: {oferta.indexador or 'N/D'} | "
                f"Taxa: {oferta.taxa_bruta or 'N/D'} | "
                f"Venc: {oferta.data_vencimento or 'N/D'} | "
                f"Emissor: {oferta.emissor or 'N/D'} | "
                f"Distribuidor: {oferta.instituicao or 'N/D'} | "
                f"FGC: {'Sim' if oferta.com_fgc else 'Não'} | "
                f"Isento IR: {'Sim' if oferta.isento_ir else 'Não'}"
            )
            resultado.append(linha)
        return "\n".join(resultado)

@tool
def comparar_taxas(ativo_a: str, ativo_b: str) -> str:
    """
    Compara as taxas de dois ativos e calcula o spread entre eles.
    Use quando o usuário quiser saber a diferença de rentabilidade entre dois investimentos.
    Exemplos: ativo_a='CDB BTG', ativo_b='CDB XP'
    """
    with get_session() as session:
        a = (
            session.query(Oferta)
            .filter(Oferta.nome.ilike(f"%{ativo_a}%"))
            .first()
        )
        b = (
            session.query(Oferta)
            .filter(Oferta.nome.ilike(f"%{ativo_b}%"))
            .first()
        )

        if not a or not b:
            return "Um ou ambos os ativos não foram encontrados."

        if a.taxa_valor is None or b.taxa_valor is None:
            return f"Taxa numérica não disponível para comparação.\n{a.nome}: {a.taxa_bruta}\n{b.nome}: {b.taxa_bruta}"

        spread = a.taxa_valor - b.taxa_valor
        return (
            f"{a.nome}: {a.taxa_bruta}\n"
            f"{b.nome}: {b.taxa_bruta}\n"
            f"Spread: {spread:.2f}%"
        )
    