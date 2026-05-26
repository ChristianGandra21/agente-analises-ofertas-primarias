"""
Pré-processamento de ofertas de renda fixa.

Limpa, normaliza e rankeia os dados antes de entregar pro agente.
Evita que o LLM receba dados sujos, incompletos ou em excesso.

Funções públicas:
    filtrar_ofertas    — remove ofertas inválidas ou vencidas
    normalizar_taxa    — extrai valor numérico de uma string de taxa
    normalizar_ofertas — preenche taxa_valor em todas as ofertas
    rankear_ofertas    — ordena por taxa_valor decrescente e limita registros
    preparar_ofertas   — pipeline completo (filtrar → normalizar → rankear)
"""

from __future__ import annotations

import re
from datetime import datetime

from src.database import Oferta


# ─── Filtro ──────────────────────────────────────────────────────────────────

def filtrar_ofertas(ofertas: list[Oferta]) -> list[Oferta]:
    """
    Remove ofertas inválidas antes de enviá-las ao agente.

    Critérios de exclusão:
    - taxa_bruta é None
    - emissor é None
    - data_vencimento é None ou já passou (data < hoje)

    Returns:
        Lista de ofertas válidas.
    """
    hoje = datetime.today().date()
    validas = []

    for oferta in ofertas:
        if oferta.taxa_bruta is None:
            continue
        if oferta.emissor is None:
            continue
        if oferta.data_vencimento is None:
            continue

        vencimento = _parse_data(oferta.data_vencimento)
        if vencimento is None or vencimento < hoje:
            continue

        validas.append(oferta)

    return validas


def _parse_data(data_str: str) -> datetime.date | None:
    """Tenta converter string de data nos formatos DD/MM/AAAA ou AAAA-MM-DD."""
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(data_str.strip(), fmt).date()
        except ValueError:
            continue
    return None


# ─── Normalização de taxa ─────────────────────────────────────────────────────

def normalizar_taxa(taxa: str) -> float | None:
    """
    Extrai o valor numérico de uma string de taxa bruta.

    Exemplos:
        "CDI+5.60% a.a."   → 5.60
        "Taxa 19.55% a.a." → 19.55
        "IPCA + 8,41%"     → 8.41
        "91% CDI"          → 91.0
        "14,35%"           → 14.35

    Usa o primeiro número decimal encontrado na string.
    Retorna None se não encontrar nenhum número.
    """
    if not taxa:
        return None

    matches = re.findall(r"[\d]+[.,][\d]+", taxa)
    if not matches:
        # Fallback: tenta número inteiro simples (ex: "15%")
        inteiros = re.findall(r"\d+", taxa)
        if inteiros:
            return float(inteiros[0])
        return None

    valor_str = matches[0].replace(",", ".")
    try:
        return float(valor_str)
    except ValueError:
        return None


# ─── Normalização de lista ────────────────────────────────────────────────────

def normalizar_ofertas(ofertas: list[Oferta]) -> list[Oferta]:
    """
    Preenche o campo taxa_valor de cada oferta, se ainda for None.

    Chama normalizar_taxa sobre taxa_bruta e atualiza o objeto em memória.
    Não persiste no banco — apenas prepara os dados para uso imediato.

    Returns:
        A mesma lista com taxa_valor preenchido onde possível.
    """
    for oferta in ofertas:
        if oferta.taxa_valor is None and oferta.taxa_bruta:
            oferta.taxa_valor = normalizar_taxa(oferta.taxa_bruta)
    return ofertas


# ─── Ranqueamento ─────────────────────────────────────────────────────────────

def rankear_ofertas(ofertas: list[Oferta], limite: int = 20) -> list[Oferta]:
    """
    Ordena por taxa_valor decrescente (maior taxa primeiro) e limita ao número
    de registros definido. Ofertas com taxa_valor = None vão para o final.

    Args:
        ofertas: Lista de ofertas já normalizadas.
        limite:  Número máximo de registros a retornar (padrão: 20).

    Returns:
        Lista ordenada e limitada.
    """
    ordenadas = sorted(
        ofertas,
        key=lambda o: o.taxa_valor if o.taxa_valor is not None else -1,
        reverse=True,
    )
    return ordenadas[:limite]


# ─── Pipeline principal ───────────────────────────────────────────────────────

def preparar_ofertas(ofertas: list[Oferta], limite: int = 20) -> list[Oferta]:
    """
    Pipeline completo de pré-processamento.

    Encadeia: filtrar → normalizar → rankear.

    Args:
        ofertas: Lista bruta de objetos Oferta vindos do banco.
        limite:  Máximo de ofertas a retornar após ranqueamento.

    Returns:
        Lista limpa, normalizada e ranqueada, pronta para o agente.
    """
    ofertas = filtrar_ofertas(ofertas)
    ofertas = normalizar_ofertas(ofertas)
    ofertas = rankear_ofertas(ofertas, limite=limite)
    return ofertas
