"use client";

import { useState } from "react";
import { ContextoCard } from "./ContextoCard";

interface ContextoItem {
  id: number;
  tipo: string | null;
  instituicao: string | null;
  data_referencia: string | null;
  resumo_estrategia: string | null;
  fonte_url: string | null;
}

interface ContextoGridProps {
  items: ContextoItem[];
}

export function ContextoGrid({ items }: ContextoGridProps) {
  const [filtro, setFiltro] = useState("Todos");

  const tipos = ["Todos", "macro", "carteira"];

  const filtered =
    filtro === "Todos"
      ? items
      : items.filter((item) => item.tipo === filtro);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tipos.map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className={`px-3 py-1 rounded-full text-xs font-sora transition-colors ${
              filtro === t
                ? "bg-btg-800 text-white"
                : "bg-mono-100 text-mono-600 hover:bg-mono-200"
            }`}
          >
            {t === "Todos" ? "Todos" : t === "macro" ? "Macro" : "Carteiras"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((item) => (
          <ContextoCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
