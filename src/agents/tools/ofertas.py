from langchain_core.tools import tool
from src.database import get_session, Oferta

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

        if tipo:
            query = query.filter(Oferta.tipo.ilike(f"%{tipo}%"))
        if indexador:
            query = query.filter(Oferta.indexador.ilike(f"%{indexador}%"))
        if instituicao:
            query = query.filter(Oferta.instituicao.ilike(f"%{instituicao}%"))

        ofertas = query.limit(20).all()

        if not ofertas:
            return "Nenhuma oferta encontrada com os critérios fornecidos."

        resultado = []
        for oferta in ofertas:
            resultado.append(
                f"{oferta.instituicao} - {oferta.tipo} {oferta.indexador} - "
                f"Taxa: {oferta.taxa_bruta} - Vencimento: {oferta.data_vencimento}"
            )
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
    