"""
Pós-processamento da resposta do agente de renda fixa.

Estrutura e valida a resposta final antes de exibir pro usuário.
Evita alucinações e formata o output de forma consistente.

Funções públicas:
    validar_resposta    — verifica se a resposta contém dados reais
    detectar_alucinacao — retorna lista de alertas sobre possíveis alucinações
    formatar_resposta   — empacota a resposta num dicionário estruturado
    pos_processar       — pipeline completo (validar → detectar → formatar)
"""

from __future__ import annotations

import re
from datetime import datetime


# ─── Frases que indicam resposta vazia / evasiva ──────────────────────────────

_FRASES_EVASIVAS = [
    "não foi possível encontrar",
    "não tenho acesso",
    "não disponível",
    "não tenho informações",
    "não possuo acesso",
    "não pude encontrar",
    "dados não disponíveis",
    "sem informações",
]

# Instituições estrangeiras que não operam no mercado brasileiro primário
_INSTITUICOES_INVALIDAS = [
    "goldman sachs",
    "morgan stanley",
    "jp morgan",
    "jpmorgan",
    "citibank",
    "citigroup",
    "deutsche bank",
    "credit suisse",
    "barclays",
    "hsbc",
    "ubs",
    "blackrock",
    "vanguard",
]

# Frases genéricas sem dados concretos
_FRASES_GENERICAS = [
    "geralmente",
    "tipicamente",
    "em geral",
    "costuma ser",
    "normalmente oferece",
    "pode variar",
    "é comum",
]


# ─── Validação ────────────────────────────────────────────────────────────────

def validar_resposta(resposta: str) -> bool:
    """
    Verifica se a resposta contém dados reais e não é evasiva.

    Retorna False se:
    - Contém frases evasivas como "não foi possível encontrar"
    - Tem menos de 100 caracteres
    - Não contém nenhum número (indica que o agente não usou dados reais)

    Returns:
        True se a resposta parece válida, False caso contrário.
    """
    if len(resposta.strip()) < 100:
        return False

    texto_lower = resposta.lower()

    for frase in _FRASES_EVASIVAS:
        if frase in texto_lower:
            return False

    # Verifica se há pelo menos um número na resposta
    if not re.search(r"\d", resposta):
        return False

    return True


# ─── Detecção de alucinação ───────────────────────────────────────────────────

def detectar_alucinacao(resposta: str) -> list[str]:
    """
    Detecta possíveis alucinações e retorna lista de alertas.

    Verifica:
    - Menção a instituições estrangeiras não presentes no banco
    - Taxas absurdas (acima de 50% ou abaixo de 0%)
    - Uso de frases genéricas sem dados específicos

    Returns:
        Lista de strings com alertas. Vazia se nenhum problema foi detectado.
    """
    alertas: list[str] = []
    texto_lower = resposta.lower()

    # Verifica instituições inválidas
    for inst in _INSTITUICOES_INVALIDAS:
        if inst in texto_lower:
            alertas.append(
                f"possível alucinação: menção à instituição '{inst}', "
                f"que não opera no mercado primário brasileiro"
            )

    # Verifica taxas absurdas — extrai todos os números percentuais
    taxas_encontradas = re.findall(
        r"(\d+[.,]\d+)\s*%|(\d+)\s*%", resposta
    )
    for grupos in taxas_encontradas:
        valor_str = grupos[0] or grupos[1]
        try:
            valor = float(valor_str.replace(",", "."))
            if valor > 50:
                alertas.append(
                    f"possível alucinação: taxa de {valor}% é improvável "
                    f"para renda fixa brasileira (acima de 50%)"
                )
            elif valor < 0:
                alertas.append(
                    f"possível alucinação: taxa negativa de {valor}%"
                )
        except ValueError:
            continue

    # Verifica frases genéricas sem dados concretos
    frases_genericas_encontradas = [
        f for f in _FRASES_GENERICAS if f in texto_lower
    ]
    if frases_genericas_encontradas:
        alertas.append(
            "resposta pode conter afirmações genéricas sem dados reais: "
            + ", ".join(f'"{f}"' for f in frases_genericas_encontradas)
        )

    return alertas


# ─── Formatação ───────────────────────────────────────────────────────────────

def formatar_resposta(resposta: str, pergunta: str) -> dict:
    """
    Estrutura a resposta num dicionário padronizado.

    Args:
        resposta: Texto gerado pelo agente.
        pergunta: Pergunta original do usuário.

    Returns:
        Dicionário com os campos:
        {
            "pergunta":  str,
            "resposta":  str,
            "valida":    bool,
            "timestamp": "DD/MM/AAAA HH:MM",
            "alertas":   list[str],
        }
    """
    valida = validar_resposta(resposta)
    alertas = detectar_alucinacao(resposta)

    if not valida:
        alertas.insert(0, "resposta sem dados reais ou muito curta")

    return {
        "pergunta": pergunta,
        "resposta": resposta,
        "valida": valida,
        "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "alertas": alertas,
    }


# ─── Pipeline principal ───────────────────────────────────────────────────────

def pos_processar(resposta: str, pergunta: str) -> dict:
    """
    Pipeline completo de pós-processamento.

    Encadeia: validar → detectar_alucinacao → formatar_resposta.

    Args:
        resposta: Texto gerado pelo agente LLM.
        pergunta: Pergunta original do usuário.

    Returns:
        Dicionário estruturado com a resposta, flag de validade,
        timestamp e lista de alertas.
    """
    valida = validar_resposta(resposta)      # noqa: F841 — usado internamente em formatar_resposta
    alertas = detectar_alucinacao(resposta)  # noqa: F841 — idem
    return formatar_resposta(resposta, pergunta)
