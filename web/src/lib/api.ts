import type {
  OfertaSchema,
  ComparacaoResponse,
  MacroItem,
  ContextoItem,
  StatusResponse,
  ChatResponse,
  ConversationItem,
  ChatMessageItem,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const getStatus = () =>
  fetcher<StatusResponse>("/api/status");

export const getMacro = () =>
  fetcher<MacroItem[]>("/api/macro");

export const getMacroHistorico = (
  series = "selic,ipca,usd_brl",
  limite = 30
) =>
  fetcher<Record<string, { data: string; valor: number }[]>>(
    `/api/macro/historico?series=${series}&limite=${limite}`
  );

export const getOfertas = (params?: {
  tipo?: string;
  indexador?: string;
  instituicao?: string;
  limite?: number;
}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params ?? {}).filter(
        ([, v]) => v !== undefined && v !== ""
      )
    ) as Record<string, string>
  ).toString();
  return fetcher<OfertaSchema[]>(`/api/ofertas${qs ? `?${qs}` : ""}`);
};

export const getContexto = (tema = "", limite = 9) =>
  fetcher<ContextoItem[]>(`/api/contexto?tema=${tema}&limite=${limite}`);

export const comparar = (ativo_a_id: number, ativo_b_id: number) =>
  fetcher<ComparacaoResponse>("/api/comparar", {
    method: "POST",
    body: JSON.stringify({ ativo_a: ativo_a_id, ativo_b: ativo_b_id }),
  });

export const chatAgente = (pergunta: string, conversaId?: number | null) =>
  fetcher<ChatResponse>("/api/agente/chat", {
    method: "POST",
    body: JSON.stringify({ pergunta, conversa_id: conversaId ?? null }),
  });

export const listarConversas = () =>
  fetcher<ConversationItem[]>("/api/agente/conversas");

export const criarConversa = (titulo?: string) =>
  fetcher<ConversationItem>("/api/agente/conversas", {
    method: "POST",
    body: JSON.stringify({ titulo }),
  });

export const listarMensagens = (conversaId: number) =>
  fetcher<ChatMessageItem[]>(`/api/agente/conversas/${conversaId}/mensagens`);

export const dispararColeta = () =>
  fetcher<{ status: string; mensagem: string }>("/api/coletar", {
    method: "POST",
  });
