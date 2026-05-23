"use client";

import { motion } from "framer-motion";
import { Warning, Robot } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { MacroLineChart } from "@/components/charts/MacroLineChart";
import { MacroSummary } from "@/components/macro/MacroSummary";
import { ContextoGrid } from "@/components/macro/ContextoGrid";
import { useMacroPage } from "@/hooks/useMacro";

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

export default function MacroPage() {
  const router = useRouter();
  const { atual, chartData, contexto, loading, error } = useMacroPage();

  if (error) {
    return (
      <div className="flex items-center gap-2 text-[#C0392B] text-sm font-sora p-4 bg-red-50 rounded-lg">
        <Warning size={16} />
        {error.message}
      </div>
    );
  }

  if (loading) return <LoadingDots />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mb-6">
        <h1 className="font-sora font-semibold text-2xl text-mono-900">
          Macro
        </h1>
        <p className="font-sora text-sm text-mono-600 mt-1">
          Indicadores econômicos e contexto de mercado
        </p>
      </div>

      <div className="grid grid-cols-5 gap-5 mb-6">
        <div className="col-span-3 bg-white border border-mono-100 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-sora font-semibold text-xs text-mono-900 uppercase tracking-wide">
              EVOLUÇÃO SELIC E IPCA
            </span>
            <span className="font-dm-mono text-xs text-mono-300">Últimos 30 dias</span>
          </div>
          <MacroLineChart data={chartData} />
        </div>
        <div className="col-span-2">
          {atual && atual.length > 0 ? (
            <MacroSummary data={atual} />
          ) : (
            <div className="text-center py-12 text-mono-300 font-sora text-sm bg-white border border-mono-100 rounded-lg">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-sora font-semibold text-sm text-mono-900 uppercase tracking-wide mb-4">
          Contexto de Mercado
        </h2>
        {contexto && contexto.length > 0 ? (
          <ContextoGrid items={contexto} />
        ) : (
          <div className="text-center py-12 text-mono-300 font-sora text-sm bg-white border border-mono-100 rounded-lg">
            Nenhum contexto disponível
          </div>
        )}
      </div>

      <button
        onClick={() => router.push("/agente?q=qual+o+cenário+macro+atual")}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-btg-800 text-white shadow-lg font-sora font-medium text-sm hover:bg-btg-700 transition-all z-50"
      >
        <Robot size={18} weight="fill" />
        Perguntar ao Agente
      </button>
    </motion.div>
  );
}
