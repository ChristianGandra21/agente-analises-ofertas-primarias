"use client";

import { motion } from "framer-motion";
import { MetricCard } from "@/components/ui/MetricCard";
import { TaxaBarChart } from "@/components/charts/TaxaBarChart";
import { OfertasTable } from "@/components/ui/OfertasTable";

const MOCK_MACRO = {
  selic: "14,75%",
  ipca: "0,43%",
  usd: "R$ 5,87",
};

const MOCK_OFERTAS = [
  { emissor: "Banco BTG Pactual", tipo: "CDB", indexador: "CDI+", taxa: 14.80, vencimento: "abr/2030", fonte: "BTG", com_fgc: true },
  { emissor: "Vale S.A.", tipo: "DEB", indexador: "CDI+", taxa: 13.20, vencimento: "jun/2029", fonte: "XP", com_fgc: false },
  { emissor: "Itaú Unibanco", tipo: "CDB", indexador: "IPCA+", taxa: 11.50, vencimento: "dez/2031", fonte: "Itaú", com_fgc: true },
  { emissor: "BR Properties", tipo: "CRI", indexador: "IPCA+", taxa: 11.00, vencimento: "mar/2032", fonte: "BTG", com_fgc: false },
  { emissor: "Rumo Logística", tipo: "CRA", indexador: "CDI+", taxa: 14.20, vencimento: "set/2028", fonte: "XP", com_fgc: false },
  { emissor: "Caixa Econômica", tipo: "LCI", indexador: "CDI+", taxa: 10.80, vencimento: "out/2027", fonte: "BTG", com_fgc: true },
];

const METRICS = [
  { label: "SELIC", value: MOCK_MACRO.selic, delta: "+0,25 pp", trend: "up" as const, subtitle: "a.a. · última reunião" },
  { label: "IPCA", value: MOCK_MACRO.ipca, delta: "estável", trend: "neutral" as const, subtitle: "mensal · acum. 12m 4,2%" },
  { label: "USD/BRL", value: MOCK_MACRO.usd, delta: "-0,12", trend: "down" as const, subtitle: "Ptax · fechamento" },
  { label: "OFERTAS", value: "9.178", delta: undefined, trend: "neutral" as const, subtitle: "ativos no banco de dados", borderColor: "#C8A951" },
];

export default function OverviewPage() {
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
          10 ATIVOS MONITORADOS
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {METRICS.map((m, i) => (
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
              Atualizado 16:30
            </span>
          </div>
          <OfertasTable data={MOCK_OFERTAS} />
        </div>
      </div>
    </motion.div>
  );
}
