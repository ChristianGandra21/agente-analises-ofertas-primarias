export interface Oferta {
  emissor: string;
  tipo: string;
  indexador: string;
  taxa: number;
  vencimento: string;
  fonte: string;
  com_fgc: boolean;
}

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
}): Promise<Oferta[]> {
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
