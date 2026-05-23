export function formatMacro(serie: string, valor: number): string {
  if (serie === "usd_brl") return `R$ ${valor.toFixed(2)}`;
  if (serie === "selic") return `${(valor * 100).toFixed(4)}%`;
  return `${valor.toFixed(2)}%`;
}

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function formatVencimento(data: string | null): string {
  if (!data) return "—";
  const [ano, mes] = data.split("-");
  return `${MESES[parseInt(mes) - 1]}/${ano}`;
}

export function taxaColor(valor: number | null): string {
  if (!valor) return "#6B6E7A";
  if (valor >= 14) return "#0D7A4E";
  if (valor >= 11) return "#C8A951";
  return "#6B6E7A";
}

export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
