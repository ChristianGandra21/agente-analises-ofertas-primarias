"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { OfertaSchema } from "@/lib/types";

interface RadarData {
  metric: string;
  a: number;
  b: number;
}

function normalizeTaxa(val: number | null | undefined): number {
  if (val == null) return 0;
  return Math.min(Math.round(((val - 9) / (15 - 9)) * 100), 100);
}

function normalizePrazo(venc: string | null | undefined): number {
  if (!venc) return 50;
  const match = venc.match(/(\d{4})/);
  if (!match) return 50;
  const year = parseInt(match[1]);
  const diff = year - 2026;
  return Math.min(Math.max(Math.round((diff / 10) * 100), 0), 100);
}

function normalizeSeguranca(fgc: boolean | null | undefined): number {
  return fgc ? 100 : 50;
}

function normalizeLiquidez(tipo: string | null | undefined): number {
  if (!tipo) return 50;
  const map: Record<string, number> = {
    LCI: 100,
    LCA: 100,
    CDB: 80,
    CRA: 40,
    CRI: 40,
    DEB: 30,
  };
  return map[tipo] ?? 50;
}

function normalizeIsencao(isento: boolean | null | undefined): number {
  return isento ? 100 : 0;
}

interface RadarChartProps {
  ativoA: OfertaSchema;
  ativoB: OfertaSchema;
}

export function RadarChart({ ativoA: a, ativoB: b }: RadarChartProps) {
  const data: RadarData[] = [
    { metric: "Taxa", a: normalizeTaxa(a.taxa_valor), b: normalizeTaxa(b.taxa_valor) },
    { metric: "Prazo", a: normalizePrazo(a.data_vencimento), b: normalizePrazo(b.data_vencimento) },
    { metric: "Segurança", a: normalizeSeguranca(a.com_fgc), b: normalizeSeguranca(b.com_fgc) },
    { metric: "Liquidez", a: normalizeLiquidez(a.tipo), b: normalizeLiquidez(b.tipo) },
    { metric: "Isenção IR", a: normalizeIsencao(a.isento_ir), b: normalizeIsencao(b.isento_ir) },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsRadar data={data}>
        <PolarGrid stroke="#EDEEF2" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fontFamily: "DM Mono", fontSize: 11, fill: "#6B6E7A" }}
        />
        <Radar
          name={a.emissor ?? "Ativo A"}
          dataKey="a"
          stroke="#003087"
          fill="#003087"
          fillOpacity={0.15}
        />
        <Radar
          name={b.emissor ?? "Ativo B"}
          dataKey="b"
          stroke="#C8A951"
          fill="#C8A951"
          fillOpacity={0.15}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontFamily: "Sora", fontSize: 12 }}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
