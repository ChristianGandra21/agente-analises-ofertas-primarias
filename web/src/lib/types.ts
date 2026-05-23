export interface OfertaSchema {
  id: number;
  fonte: string;
  emissor: string | null;
  instituicao: string | null;
  nome: string | null;
  tipo: string | null;
  indexador: string | null;
  taxa_bruta: string | null;
  taxa_valor: number | null;
  data_vencimento: string | null;
  com_fgc: boolean | null;
  isento_ir: boolean | null;
}

export interface ComparacaoResult {
  ativo_a: OfertaSchema;
  ativo_b: OfertaSchema;
  spread: number | null;
  vencedor: "a" | "b" | "empate";
}

export interface ComparacaoResponse extends ComparacaoResult {
  resumo: string;
}

export interface MacroItem {
  serie: string;
  valor: number;
  data: string;
}

export interface ContextoItem {
  id: number;
  tipo: string | null;
  instituicao: string | null;
  data_referencia: string | null;
  resumo_estrategia: string | null;
  fonte_url: string | null;
}

export interface StatusResponse {
  status: string;
  total_ofertas: number;
}

export interface ChatResponse {
  resposta: string;
  valida: boolean;
  agentes_acionados: string[];
  duracao_segundos: number;
}
