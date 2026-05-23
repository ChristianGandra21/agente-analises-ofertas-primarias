"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Warning } from "@phosphor-icons/react";
import { MetricCard } from "@/components/ui/MetricCard";
import { TaxaBarChart } from "@/components/charts/TaxaBarChart";
import { OfertasTable } from "@/components/ui/OfertasTable";
import { OfertasFullTable } from "@/components/ui/OfertasFullTable";
import { useOverview } from "@/hooks/useOverview";

type Tab = "resumo" | "ofertas";

function LoadingDots() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-btg-800 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

type MacroEntry = { serie: string; valor: number; data: string };
type HistoricoEntry = { data: string; valor: number };

function calcDelta(historico: HistoricoEntry[] | undefined): {
  delta: string | undefined;
  trend: "up" | "down" | "neutral";
} {
  if (!historico || historico.length < 2) return { delta: undefined, trend: "neutral" };
  const [prev, curr] = historico; // limite=2 → [mais antigo, mais recente]
  const diff = curr.valor - prev.valor;
  if (Math.abs(diff) < 0.001) return { delta: "estável", trend: "neutral" };
  const sign = diff > 0 ? "+" : "";
  return {
    delta: `${sign}${diff.toFixed(2)} pp`,
    trend: diff > 0 ? "up" : "down",
  };
}

function buildMetrics(
  macro: MacroEntry[] | undefined,
  historicoMacro: Record<string, HistoricoEntry[]> | undefined,
  total: number | undefined
) {
  const selic = macro?.find((m) => m.serie === "selic");
  const ipca = macro?.find((m) => m.serie === "ipca");
  const usd = macro?.find((m) => m.serie === "usd_brl");

  const selicDelta = calcDelta(historicoMacro?.selic);
  const ipcaDelta = calcDelta(historicoMacro?.ipca);

  // Formata a data "DD/MM/AAAA" → "MMM/AAAA" para o subtitle
  function fmtData(data: string | undefined): string {
    if (!data) return "—";
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const parts = data.split("/");
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1;
      return `${meses[m] ?? parts[1]}/${parts[2]}`;
    }
    return data;
  }

  return [
    {
      label: "SELIC",
      value: selic ? `${selic.valor.toFixed(2)}%` : "—",
      delta: selicDelta.delta,
      trend: selicDelta.trend,
      subtitle: `a.a. · ${fmtData(selic?.data)}`,
    },
    {
      label: "IPCA",
      value: ipca ? `${ipca.valor.toFixed(2)}%` : "—",
      delta: ipcaDelta.delta,
      trend: ipcaDelta.trend,
      subtitle: `acum. 12m · ${fmtData(ipca?.data)}`,
    },
    {
      label: "USD/BRL",
      value: usd ? `R$ ${usd.valor.toFixed(2)}` : "—",
      delta: undefined,
      trend: "neutral" as const,
      subtitle: `Ptax · ${fmtData(usd?.data)}`,
    },
    {
      label: "OFERTAS",
      value: total != null ? total.toLocaleString("pt-BR") : "—",
      delta: undefined,
      trend: "neutral" as const,
      subtitle: "ativos no banco de dados",
      borderColor: "#C8A951" as const,
    },
  ];
}

export default function OverviewPage() {
  const { status, macro, historicoMacro, ofertas, loading, error } = useOverview();
  const [tab, setTab] = useState<Tab>("resumo");
  const total = status?.total_ofertas;

  const mesAno = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  if (error) {
    return (
      <div className="flex items-center gap-2 text-[#C0392B] text-sm font-sora p-4 bg-red-50 rounded-lg">
        <Warning size={16} />
        {error.message}
      </div>
    );
  }

  if (loading) return <LoadingDots />;

  const metrics = buildMetrics(macro, historicoMacro, total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-sora font-semibold text-2xl text-mono-900">
            Visão Geral
          </h1>
          <p className="font-sora text-sm text-mono-600 mt-1">
            Mercado de ofertas primárias · {mesAno.charAt(0).toUpperCase() + mesAno.slice(1)}
          </p>
        </div>
        <span className="font-dm-mono text-xs text-mono-300 uppercase tracking-widest mt-1">
          {total ?? "—"} ATIVOS MONITORADOS
        </span>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* Sub-abas */}
      <div className="flex gap-1 mb-5 border-b border-mono-200">
        {(["resumo", "ofertas"] as Tab[]).map((t) => (
          <button
            key={t}
            id={`tab-${t}`}
            onClick={() => setTab(t)}
            className={`font-sora text-[13px] px-4 py-2 -mb-px border-b-2 transition-colors duration-150 ${
              tab === t
                ? "border-btg-800 text-btg-800 font-medium"
                : "border-transparent text-mono-600 hover:text-mono-900"
            }`}
          >
            {t === "resumo" ? "Resumo" : `Todas as Ofertas${total != null ? ` (${total.toLocaleString("pt-BR")})` : ""}`}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <AnimatePresence mode="wait">
        {tab === "resumo" ? (
          <motion.div
            key="resumo"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-5 gap-5"
          >
            <div className="col-span-2 bg-white border border-mono-100 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="font-sora font-semibold text-xs text-mono-900 uppercase tracking-wide">
                  TAXAS POR INDEXADOR
                </span>
                <span className="font-dm-mono text-xs text-mono-300">% a.a.</span>
              </div>
              <TaxaBarChart />
            </div>

            <div className="col-span-3 bg-white border border-mono-100 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="font-sora font-semibold text-xs text-mono-900 uppercase tracking-wide">
                  ÚLTIMAS OFERTAS
                </span>
                <span className="font-dm-mono text-xs text-mono-300">
                  {status
                    ? new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
              </div>
              {ofertas && ofertas.length > 0 ? (
                <OfertasTable
                  data={ofertas.map((o) => ({
                    emissor: o.emissor ?? "—",
                    tipo: o.tipo ?? "—",
                    indexador: o.indexador ?? "—",
                    taxa: o.taxa_valor ?? 0,
                    vencimento: o.data_vencimento ?? "—",
                    fonte: o.fonte,
                    com_fgc: o.com_fgc ?? false,
                  }))}
                />
              ) : (
                <div className="text-center py-12 text-mono-300 font-sora text-sm">
                  Nenhuma oferta disponível
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ofertas"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <OfertasFullTable />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
