"use client";

import { motion } from "framer-motion";
import { Robot } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { MacroLineChart } from "@/components/charts/MacroLineChart";
import { MacroSummary } from "@/components/macro/MacroSummary";
import { ContextoGrid } from "@/components/macro/ContextoGrid";
import { useMacro } from "@/hooks/useMacro";

const MOCK_CONTEXTO = [
  { id: 1, tipo: "macro", instituicao: "XP Investimentos", data_referencia: "Maio 2026", resumo_estrategia: "A XP manteve postura conservadora em renda fixa para maio, com preferência por ativos pós-fixados e duration curta. O cenário fiscal continua sendo o principal risco, com a Selic devendo permanecer elevada por mais tempo.", fonte_url: "#" },
  { id: 2, tipo: "macro", instituicao: "Itaú BBA", data_referencia: "Maio 2026", resumo_estrategia: "O Itaú BBA revisou sua projeção de Selic para 15,00% ao final de 2026, citando pressões cambiais e resiliência do mercado de trabalho. Recomenda cautela com ativos indexados à inflação.", fonte_url: "#" },
  { id: 3, tipo: "carteira", instituicao: "BTG Pactual", data_referencia: "Maio 2026", resumo_estrategia: "A carteira recomendada de renda fixa do BTG para maio inclui 40% em CDBs pós-fixados, 30% em LCIs e LCAs, 20% em debêntures incentivadas e 10% em CRAs. Duration média de 2 anos.", fonte_url: "#" },
  { id: 4, tipo: "macro", instituicao: "Santander", data_referencia: "Abril 2026", resumo_estrategia: "O Santander destaca que a inflação de serviços segue acima da meta, o que deve manter o BCB em ciclo de aperto. Projeção de IPCA para 2026 em 5,8%.", fonte_url: "#" },
  { id: 5, tipo: "carteira", instituicao: "XP Investimentos", data_referencia: "Maio 2026", resumo_estrategia: "A XP recomenda exposição a ativos isentos de IR para investidores de pessoa física, com destaque para LCIs e LCAs indexadas ao CDI que pagam acima de 100% do CDI.", fonte_url: "#" },
  { id: 6, tipo: "carteira", instituicao: "Itaú BBA", data_referencia: "Abril 2026", resumo_estrategia: "O Itaú BBA divulgou sua carteira de debêntures para o trimestre, com 5 ativos selecionados por spread e qualidade de crédito. Destaque para debêntures da Vale e da Rumo.", fonte_url: "#" },
];

const MOCK_ATUAL = [
  { serie: "selic", valor: 0.000586, data: "30/04/2026" },
  { serie: "ipca", valor: 0.0043, data: "01/12/2025" },
  { serie: "usd_brl", valor: 4.99, data: "30/04/2026" },
];

const MOCK_CHART = Array.from({ length: 30 }, (_, i) => {
  const day = 30 - i;
  return {
    data: `${String(day).padStart(2, "0")}/04`,
    selic: 14.5 + Math.sin(i * 0.3) * 0.3,
    ipca: 0.3 + Math.sin(i * 0.5) * 0.15,
  };
});

export default function MacroPage() {
  const router = useRouter();
  const { atual, chartData, contexto } = useMacro();

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
          <MacroLineChart data={chartData.length > 0 ? chartData : MOCK_CHART} />
        </div>
        <div className="col-span-2">
          <MacroSummary data={atual ?? MOCK_ATUAL} />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-sora font-semibold text-sm text-mono-900 uppercase tracking-wide mb-4">
          Contexto de Mercado
        </h2>
        <ContextoGrid items={contexto ?? MOCK_CONTEXTO} />
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
