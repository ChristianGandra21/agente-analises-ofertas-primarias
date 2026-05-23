"use client";

interface MacroItem {
  serie: string;
  valor: number;
  data: string;
}

const SERIE_COLORS: Record<string, string> = {
  selic: "#003087",
  ipca: "#C8A951",
  usd_brl: "#0D7A4E",
};

const SERIE_LABELS: Record<string, string> = {
  selic: "SELIC",
  ipca: "IPCA",
  usd_brl: "USD/BRL",
};

function formatValor(serie: string, valor: number): string {
  if (serie === "usd_brl") return `R$ ${valor.toFixed(2)}`;
  if (serie === "selic") return `${(valor * 100 * 252).toFixed(2)}% a.a.`;
  return `${(valor * 100).toFixed(2)}%`;
}

function formatSubLabel(serie: string): string {
  if (serie === "selic") return "a.a.";
  if (serie === "ipca") return "m.m.";
  return "Ptax";
}

interface MacroSummaryProps {
  data: MacroItem[];
}

export function MacroSummary({ data }: MacroSummaryProps) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div
          key={item.serie}
          className="bg-white border border-mono-100 rounded-lg p-4"
          style={{ borderLeft: `3px solid ${SERIE_COLORS[item.serie] ?? "#6B6E7A"}` }}
        >
          <p className="font-dm-mono text-xs text-mono-300 uppercase tracking-widest mb-1">
            {SERIE_LABELS[item.serie] ?? item.serie}
          </p>
          <p className="font-dm-mono text-2xl font-medium text-mono-900">
            {formatValor(item.serie, item.valor)}
          </p>
          <p className="font-dm-mono text-xs text-mono-300 mt-1">
            Data: {item.data} ({formatSubLabel(item.serie)})
          </p>
        </div>
      ))}
    </div>
  );
}
