"use client";

import { useState } from "react";
import type { OfertaSchema, ComparacaoResult } from "@/lib/types";

export function useComparador() {
  const [ativoA, setAtivoA] = useState<OfertaSchema | null>(null);
  const [ativoB, setAtivoB] = useState<OfertaSchema | null>(null);
  const [resultado, setResultado] = useState<ComparacaoResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function comparar() {
    if (!ativoA || !ativoB) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo_a: ativoA.id, ativo_b: ativoB.id }),
      });
      if (!res.ok) throw new Error("Falha ao comparar");
      const data: ComparacaoResult = await res.json();
      setResultado(data);
    } catch {
      const { mockComparar } = await import("@/lib/api");
      const data = await mockComparar(ativoA, ativoB);
      setResultado(data);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAtivoA(null);
    setAtivoB(null);
    setResultado(null);
  }

  return { ativoA, ativoB, setAtivoA, setAtivoB, resultado, loading, comparar, reset };
}
