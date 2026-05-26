"use client";

import { MagnifyingGlass, SpinnerGap } from "@phosphor-icons/react";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { getOfertas } from "@/lib/api";
import type { OfertaSchema } from "@/lib/types";

const TIPOS = ["Todos", "CDB", "CRA", "CRI", "LCI", "LCA", "DEB", "DEBENTURE", "LC", "LF", "FIDC", "CCB"];
const INDEXADORES = ["Todos", "CDI+", "IPCA+", "Prefixado", "Selic"];

interface AtivoSelectorProps {
  label: "A" | "B";
  onSelect: (oferta: OfertaSchema) => void;
}

export function AtivoSelector({ label, onSelect }: AtivoSelectorProps) {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [indexador, setIndexador] = useState("Todos");
  const [open, setOpen] = useState(false);

  const swrKey = useMemo(() => {
    const params: Record<string, string> = { limite: "50" };
    if (tipo !== "Todos") params.tipo = tipo;
    if (indexador !== "Todos") params.indexador = indexador;
    return ["/api/ofertas", params] as const;
  }, [tipo, indexador]);

  const { data: ativos, isLoading } = useSWR(
    swrKey,
    ([, params]) => getOfertas(params),
    { revalidateOnFocus: false }
  );

  const filtered = useMemo(() => {
    if (!ativos) return [];
    if (!query) return ativos.slice(0, 10);
    const q = query.toLowerCase();
    return ativos
      .filter(
        (a) =>
          (a.nome?.toLowerCase().includes(q)) ||
          (a.emissor?.toLowerCase().includes(q)) ||
          (a.instituicao?.toLowerCase().includes(q)) ||
          (a.tipo?.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [ativos, query]);

  return (
    <div className="flex flex-col gap-3">
      <p className="font-dm-mono text-[10px] uppercase tracking-widest text-mono-600">
        ATIVO {label}
      </p>

      <div className="flex flex-wrap gap-2">
        <select
          value={tipo}
          onChange={(e) => { setTipo(e.target.value); setOpen(true); }}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select
          value={indexador}
          onChange={(e) => { setIndexador(e.target.value); setOpen(true); }}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          {INDEXADORES.map((i) => <option key={i}>{i}</option>)}
        </select>
      </div>

      <div className="relative">
        {isLoading ? (
          <SpinnerGap
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-btg-800 animate-spin"
          />
        ) : (
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-300"
          />
        )}
        <input
          type="text"
          placeholder={isLoading ? "Carregando ativos..." : "Buscar ativo..."}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-mono-50 border border-mono-200 rounded-md py-2.5 pl-9 pr-3 font-sora text-[13px] text-mono-900 placeholder-mono-300 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        />

        {open && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-mono-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
            {filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onSelect(a);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full text-left px-3 py-2.5 font-sora text-[13px] text-mono-900 border-b border-mono-200 last:border-b-0 hover:bg-[#F2F5FC] transition-colors"
              >
                <span className="font-medium">{a.tipo}</span>{" "}
                {a.emissor}{" "}
                <span className="text-mono-600">{a.indexador}</span>{" "}
                <span className="text-green-600 font-dm-mono">{a.taxa_bruta}</span>
              </button>
            ))}
          </div>
        )}

        {open && !isLoading && filtered.length === 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-mono-200 rounded-md shadow-lg px-3 py-4 text-center font-sora text-[13px] text-mono-300">
            Nenhum ativo encontrado
          </div>
        )}
      </div>
    </div>
  );
}
