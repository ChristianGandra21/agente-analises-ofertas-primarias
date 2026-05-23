"use client";

import { useState } from "react";
import { comparar } from "@/lib/api";
import type { OfertaSchema, ComparacaoResponse } from "@/lib/types";

export function useComparador() {
  const [ativoA, setAtivoA] = useState<OfertaSchema | null>(null);
  const [ativoB, setAtivoB] = useState<OfertaSchema | null>(null);
  const [resultado, setResultado] = useState<ComparacaoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function executarComparacao() {
    if (!ativoA || !ativoB) return;
    setLoading(true);
    setError(null);
    try {
      const res = await comparar(ativoA.id, ativoB.id);
      setResultado(res);
    } catch {
      setError("Erro ao comparar ativos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAtivoA(null);
    setAtivoB(null);
    setResultado(null);
    setError(null);
  }

  return {
    ativoA,
    setAtivoA,
    ativoB,
    setAtivoB,
    resultado,
    loading,
    error,
    executarComparacao,
    reset,
  };
}
