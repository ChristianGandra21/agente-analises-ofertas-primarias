import type { OfertaSchema, ComparacaoResult } from "./types";

export interface Macro {
  selic: string;
  ipca: string;
  usd: string;
}

export interface Status {
  total_ofertas: number;
  ultima_coleta: string;
}

export async function getMacro(): Promise<Macro> {
  const res = await fetch("/api/macro");
  if (!res.ok) throw new Error("Failed to fetch macro");
  return res.json();
}

export async function getOfertas(opts?: {
  limite?: number;
}): Promise<OfertaSchema[]> {
  const params = new URLSearchParams();
  if (opts?.limite) params.set("limite", String(opts.limite));
  const res = await fetch(`/api/ofertas?${params}`);
  if (!res.ok) throw new Error("Failed to fetch ofertas");
  return res.json();
}

export async function getStatus(): Promise<Status> {
  const res = await fetch("/api/status");
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

export async function compararOfertas(
  ativoA: number,
  ativoB: number
): Promise<ComparacaoResult> {
  const res = await fetch("/api/comparar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo_a: ativoA, ativo_b: ativoB }),
  });
  if (!res.ok) throw new Error("Failed to compare");
  return res.json();
}

export async function mockComparar(
  a: OfertaSchema,
  b: OfertaSchema
): Promise<ComparacaoResult> {
  const spread =
    a.taxa_valor != null && b.taxa_valor != null
      ? Math.round((a.taxa_valor - b.taxa_valor) * 100) / 100
      : null;
  return {
    ativo_a: a,
    ativo_b: b,
    spread,
    vencedor:
      spread == null
        ? "empate"
        : spread > 0
          ? "a"
          : spread < 0
            ? "b"
            : "empate",
  };
}
