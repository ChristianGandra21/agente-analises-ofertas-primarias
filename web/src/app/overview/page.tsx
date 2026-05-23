"use client";

import { motion } from "framer-motion";
import { Warning } from "@phosphor-icons/react";
import { MetricCard } from "@/components/ui/MetricCard";
import { TaxaBarChart } from "@/components/charts/TaxaBarChart";
import { OfertasTable } from "@/components/ui/OfertasTable";
import { useOverview } from "@/hooks/useOverview";

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

function buildMetrics(macro: { serie: string; valor: number }[] | undefined, total: number | undefined) {
  const selic = macro?.find((m) => m.serie === "selic");
  const ipca = macro?.find((m) => m.serie === "ipca");
  const usd = macro?.find((m) => m.serie === "usd_brl");

  return [
    {
      label: "SELIC",
      value: selic ? `${(selic.valor * 100 * 252).toFixed(2)}%` : "—",
      delta: "+0,25 pp",
      trend: "up" as const,
      subtitle: "a.a. · última reunião",
    },
    {
      label: "IPCA",
      value: ipca ? `${(ipca.valor * 100).toFixed(2)}%` : "—",
      delta: "estável",
      trend: "neutral" as const,
      subtitle: "mensal · acum. 12m 4,2%",
    },
    {
      label: "USD/BRL",
      value: usd ? `R$ ${usd.valor.toFixed(2)}` : "—",
      delta: "-0,12",
      trend: "down" as const,
      subtitle: "Ptax · fechamento",
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
  const { status, macro, ofertas, loading, error } = useOverview();
  const total = status?.total_ofertas;

  if (error) {
    return (
      <div className="flex items-center gap-2 text-[#C0392B] text-sm font-sora p-4 bg-red-50 rounded-lg">
        <Warning size={16} />
        {error.message}
      </div>
    );
  }

  if (loading) return <LoadingDots />;

  const metrics = buildMetrics(macro, total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-sora font-semibold text-2xl text-mono-900">
            Visão Geral
          </h1>
          <p className="font-sora text-sm text-mono-600 mt-1">
            Mercado de ofertas primárias · Maio 2026
          </p>
        </div>
        <span className="font-dm-mono text-xs text-mono-300 uppercase tracking-widest mt-1">
          {total ?? "—"} ATIVOS MONITORADOS
        </span>
      </div>

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

      <div className="grid grid-cols-5 gap-5">
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
              Atualizado {status ? "16:30" : "—"}
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
      </div>
    </motion.div>
  );
}
