"""
Utilitarios de limpeza e validacao para scrapers.
"""

from __future__ import annotations

import re
from typing import Iterable


_NUM_RE = re.compile(r"\d+[.,]?\d*")


def normalize_text(value: str | None) -> str | None:
    if value is None:
        return None
    text = " ".join(value.split()).strip()
    return text or None


def parse_percent(value: str | None) -> float | None:
    if not value:
        return None
    matches = _NUM_RE.findall(value)
    if not matches:
        return None
    nums = []
    for m in matches:
        try:
            nums.append(float(m.replace(",", ".")))
        except ValueError:
            continue
    if not nums:
        return None
    return max(nums)


def normalize_tipo(value: str | None) -> str | None:
    if not value:
        return None
    raw = normalize_text(value)
    if not raw:
        return None
    upper = raw.upper()
    for token in ["CDB", "LCI", "LCA", "CRI", "CRA", "DEB", "DEBENTURE", "DEBENTURES", "LC", "LF", "FIDC"]:
        if token in upper:
            return "DEB" if token in {"DEBENTURE", "DEBENTURES"} else token
    return upper


def normalize_indexador(value: str | None) -> str | None:
    if not value:
        return None
    raw = normalize_text(value)
    if not raw:
        return None
    upper = raw.upper()
    if "IPCA" in upper:
        return "IPCA"
    if "CDI" in upper:
        return "CDI"
    if "SELIC" in upper:
        return "SELIC"
    if "PRE" in upper or "PREFIX" in upper:
        return "PREFIXADO"
    return upper


def is_valid_oferta(
    nome: str | None,
    emissor: str | None,
    tipo: str | None,
    taxa_bruta: str | None,
) -> bool:
    if not (nome or emissor):
        return False
    if not tipo:
        return False
    if not taxa_bruta:
        return False
    return True


def unique_by_url(items: Iterable[dict]) -> list[dict]:
    seen = set()
    result = []
    for item in items:
        url = item.get("url")
        if not url or url in seen:
            continue
        seen.add(url)
        result.append(item)
    return result
