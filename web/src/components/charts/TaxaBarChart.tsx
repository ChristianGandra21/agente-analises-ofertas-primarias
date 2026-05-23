"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import useSWR from "swr";
import { getOfertas } from "@/lib/api";
import type { OfertaSchema } from "@/lib/types";

// Calcula taxa média por agrupamento de indexador a partir das ofertas reais
function buildChartData(ofertas: OfertaSchema[]) {
  const grupos: Record<string, { soma: number; count: number; cor: string }> = {
    "CDI+":      { soma: 0, count: 0, cor: "#003087" },
    "IPCA+":     { soma: 0, count: 0, cor: "#C8A951" },
    "Prefixado": { soma: 0, count: 0, cor: "#6B6E7A" },
    "Selic":     { soma: 0, count: 0, cor: "#0D7A4E" },
  };

  for (const o of ofertas) {
    if (o.taxa_valor == null) continue;
    const idx = o.indexador ?? "";
    const upper = idx.toUpperCase();
    let grupo: string | null = null;

    if (upper.includes("CDI"))   grupo = "CDI+";
    else if (upper.includes("IPCA"))  grupo = "IPCA+";
    else if (upper.includes("SELIC")) grupo = "Selic";
    else if (upper.includes("PREF") || upper.includes("PRÉ")) grupo = "Prefixado";

    // Tenta derivar do taxa_bruta se indexador for nulo
    if (!grupo && o.taxa_bruta) {
      const tb = o.taxa_bruta.toUpperCase();
      if (tb.includes("CDI"))   grupo = "CDI+";
      else if (tb.includes("IPCA"))  grupo = "IPCA+";
      else if (tb.includes("SELIC")) grupo = "Selic";
      else grupo = "Prefixado";
    }

    if (grupo && grupos[grupo]) {
      grupos[grupo].soma += o.taxa_valor;
      grupos[grupo].count += 1;
    }
  }

  return Object.entries(grupos)
    .filter(([, g]) => g.count > 0)
    .map(([name, g]) => ({
      name,
      taxa: parseFloat((g.soma / g.count).toFixed(2)),
      cor: g.cor,
      count: g.count,
    }));
}

export function TaxaBarChart() {
  const { data: ofertas, isLoading } = useSWR(
    "/api/ofertas?all=1",
    () => getOfertas({ limite: 9999 }),
    { revalidateOnFocus: false }
  );

  const chartData = buildChartData(ofertas ?? []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-btg-800 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-mono-300 font-sora text-sm">
        Sem dados de taxa disponíveis
      </div>
    );
  }

  const minTaxa = Math.max(0, Math.floor(Math.min(...chartData.map((d) => d.taxa)) - 1));
  const maxTaxa = Math.ceil(Math.max(...chartData.map((d) => d.taxa)) + 1);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ left: 80, right: 50, top: 8, bottom: 8 }}
      >
        <XAxis
          type="number"
          domain={[minTaxa, maxTaxa]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{
            fontFamily: "DM Mono",
            fontSize: 11,
            fill: "#6B6E7A",
          }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{
            fontFamily: "DM Mono",
            fontSize: 11,
            fill: "#1A1C23",
          }}
        />
        <Tooltip
          formatter={(v: unknown, _: unknown, props: { payload?: { count?: number } }) => [
            `${Number(v).toFixed(2)}% a.a. (média de ${props.payload?.count ?? "?"} ativo(s))`,
            "Taxa média",
          ]}
          contentStyle={{
            fontFamily: "Sora",
            fontSize: 12,
            border: "1px solid #EDEEF2",
          }}
        />
        <Bar dataKey="taxa" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
