"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowSquareOut } from "@phosphor-icons/react";

interface ContextoItem {
  id: number;
  tipo: string | null;
  instituicao: string | null;
  data_referencia: string | null;
  resumo_estrategia: string | null;
  fonte_url: string | null;
}

const CONTEXTO_BADGE: Record<string, string> = {
  macro: "bg-[#E8EEF8] text-btg-800",
  carteira: "bg-[#F5EDD6] text-[#8B6914]",
};

interface ContextoCardProps {
  item: ContextoItem;
}

export function ContextoCard({ item }: ContextoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tipo = item.tipo ?? "macro";
  const badgeClass = CONTEXTO_BADGE[tipo] ?? "bg-mono-100 text-mono-600";

  return (
    <div
      className="bg-white border border-mono-200 rounded-lg p-5 cursor-pointer transition-all duration-150 hover:border-btg-800 hover:shadow-[0_4px_12px_rgba(0,48,135,0.08)] hover:-translate-y-0.5"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block rounded-sm px-2 py-0.5 font-dm-mono text-[10px] font-medium uppercase ${badgeClass}`}
        >
          {tipo}
        </span>
        <span className="font-sora text-xs text-mono-600">
          {item.instituicao ?? "—"}
        </span>
      </div>

      <p className="font-sora font-medium text-sm text-mono-900 line-clamp-2">
        {item.resumo_estrategia
          ? item.resumo_estrategia.split(".").slice(0, 2).join(".") + "."
          : "Sem conteúdo"}
      </p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-mono-100 overflow-hidden"
          >
            <p className="font-sora text-sm text-mono-700 leading-relaxed">
              {item.resumo_estrategia ?? "—"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-3">
        <span className="font-dm-mono text-[11px] text-mono-300">
          {item.data_referencia ?? "—"}
        </span>
        {item.fonte_url && (
          <a
            href={item.fonte_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 font-dm-mono text-[11px] text-btg-800 hover:underline"
          >
            Ver fonte <ArrowSquareOut size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
