"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "@phosphor-icons/react";
import { RadarChart } from "@/components/charts/RadarChart";
import type { ComparacaoResponse } from "@/lib/types";

interface RowProps {
  label: string;
  valA: string | number | boolean | null | undefined;
  valB: string | number | boolean | null | undefined;
  winner?: "a" | "b" | "neutral";
  format?: "text" | "taxa" | "check";
}

function Row({ label, valA, valB, winner = "neutral", format = "text" }: RowProps) {
  const renderVal = (v: string | number | boolean | null | undefined) => {
    if (format === "check") {
      return v ? (
        <Check size={14} weight="bold" className="text-green-600" />
      ) : (
        <X size={14} weight="bold" className="text-mono-300" />
      );
    }
    const str = v?.toString() ?? "—";
    if (format === "taxa") return str;
    return str;
  };

  const isAWin = winner === "a";
  const isBWin = winner === "b";

  const cellClass = (isWin: boolean) =>
    `font-dm-mono text-[13px] px-4 py-3 ${isWin ? "font-bold text-btg-800" : "text-mono-600"}`;

  return (
    <tr className="border-b border-mono-200 last:border-b-0">
      <td className={cellClass(isAWin)} style={isAWin ? { color: "#003087" } : undefined}>
        {renderVal(valA)}
      </td>
      <td className="font-dm-mono text-[10px] uppercase tracking-widest text-mono-300 text-center px-4 py-3 bg-mono-50">
        {label}
      </td>
      <td className={cellClass(isBWin)} style={isBWin ? { color: "#C8A951" } : undefined}>
        {renderVal(valB)}
      </td>
    </tr>
  );
}

function melhorTaxa(a: ComparacaoResponse["ativo_a"], b: ComparacaoResponse["ativo_b"]): "a" | "b" | "neutral" {
  if (a.taxa_valor == null && b.taxa_valor == null) return "neutral";
  if (a.taxa_valor == null) return "b";
  if (b.taxa_valor == null) return "a";
  if (Math.abs(a.taxa_valor - b.taxa_valor) < 0.01) return "neutral";
  return a.taxa_valor > b.taxa_valor ? "a" : "b";
}

interface ComparacaoResultProps {
  data: ComparacaoResponse;
}

export function ComparacaoResultView({ data }: ComparacaoResultProps) {
  const { ativo_a: a, ativo_b: b, spread, vencedor } = data;
  const taxaWinner = melhorTaxa(a, b);

  const rows = [
    { label: "TAXA", valA: a.taxa_bruta, valB: b.taxa_bruta, winner: taxaWinner, format: "taxa" as const },
    { label: "VENCIMENTO", valA: a.data_vencimento, valB: b.data_vencimento, winner: "neutral" as const },
    { label: "FGC", valA: a.com_fgc, valB: b.com_fgc, winner: "neutral" as const, format: "check" as const },
    { label: "INDEXADOR", valA: a.indexador, valB: b.indexador, winner: "neutral" as const },
    { label: "FONTE", valA: a.fonte, valB: b.fonte, winner: "neutral" as const },
  ];

  const spreadText =
    spread != null
      ? vencedor === "a"
        ? `+${spread.toFixed(2)}pp em favor de ${a.emissor ?? "Ativo A"}`
        : vencedor === "b"
          ? `+${Math.abs(spread).toFixed(2)}pp em favor de ${b.emissor ?? "Ativo B"}`
          : "Empate técnico"
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {spreadText && (
        <div className="bg-[#E8EEF8] border border-btg-800 rounded-lg px-5 py-4 flex items-center gap-3">
          <span className="font-dm-mono text-sm text-btg-800">
            {spreadText}
          </span>
          <span className="font-dm-mono text-[11px] text-btg-800/60">
            {a.taxa_bruta} <ArrowRight size={12} className="inline" /> {b.taxa_bruta}
          </span>
        </div>
      )}

      <div className="bg-white border border-mono-200 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="font-sora font-semibold text-[13px] text-mono-900 px-4 py-3 border-b border-btg-800 bg-white">
                {a.emissor ?? "Ativo A"}
              </th>
              <th className="font-dm-mono text-[10px] uppercase tracking-widest text-mono-300 text-center px-4 py-3 border-b border-btg-800 bg-mono-50">
                MÉTRICA
              </th>
              <th className="font-sora font-semibold text-[13px] text-mono-900 px-4 py-3 border-b border-btg-800 bg-white">
                {b.emissor ?? "Ativo B"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Row key={row.label} {...row} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-mono-200 rounded-lg p-5">
        <p className="font-sora font-semibold text-xs text-mono-900 uppercase tracking-wide mb-4">
          Comparativo por critérios
        </p>
        <RadarChart ativoA={a} ativoB={b} />
      </div>
    </motion.div>
  );
}
