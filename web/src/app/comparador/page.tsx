"use client";

import { motion } from "framer-motion";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import { AtivoSelector } from "@/components/comparador/AtivoSelector";
import { AtivoPreview } from "@/components/comparador/AtivoPreview";
import { ComparacaoResultView } from "@/components/comparador/ComparacaoResult";
import { useComparador } from "@/hooks/useComparador";

export default function ComparadorPage() {
  const {
    ativoA,
    ativoB,
    setAtivoA,
    setAtivoB,
    resultado,
    loading,
    comparar,
  } = useComparador();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mb-8">
        <h1 className="font-sora font-semibold text-2xl text-mono-900">
          Comparador
        </h1>
        <p className="font-sora text-sm text-mono-600 mt-1">
          Compare ofertas de renda fixa lado a lado
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <AtivoSelector
            label="A"
            onSelect={setAtivoA}
          />
          {ativoA && <AtivoPreview ativo={ativoA} side="A" />}
        </div>
        <div className="space-y-4">
          <AtivoSelector
            label="B"
            onSelect={setAtivoB}
          />
          {ativoB && <AtivoPreview ativo={ativoB} side="B" />}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={comparar}
          disabled={!ativoA || !ativoB || loading}
          className="flex items-center gap-2 px-8 py-3 bg-btg-800 text-white font-sora font-medium text-sm rounded-lg hover:bg-btg-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowsLeftRight size={18} />
          {loading ? "Comparando..." : "Comparar ativos"}
        </button>
      </div>

      {resultado && (
        <div className="max-w-3xl mx-auto">
          <ComparacaoResultView data={resultado} />
        </div>
      )}
    </motion.div>
  );
}
