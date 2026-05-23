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
