"use client";

import { Check, X, ArrowUp, ArrowDown, ArrowsDownUp, SpinnerGap, MagnifyingGlass, Funnel, ArrowLeft, ArrowRight, Warning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { useOfertas, type SortKey } from "@/hooks/useOfertas";
import type { OfertaSchema } from "@/lib/types";

function taxaColor(valor: number | null): string {
  if (valor == null) return "#6B6E7A";
  if (valor >= 14) return "#0D7A4E";
  if (valor >= 11) return "#C8A951";
  return "#6B6E7A";
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowsDownUp size={12} className="text-mono-300 ml-1 inline" />;
  return dir === "asc"
    ? <ArrowUp size={12} className="text-btg-800 ml-1 inline" weight="bold" />
    : <ArrowDown size={12} className="text-btg-800 ml-1 inline" weight="bold" />;
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <tr>
      <td colSpan={8} className="text-center py-16 text-mono-300 font-sora text-sm">
        {filtered ? "Nenhuma oferta encontrada com os filtros aplicados." : "Nenhuma oferta disponível no banco de dados."}
      </td>
    </tr>
  );
}

export function OfertasFullTable() {
  const {
    data,
    total,
    totalAll,
    isLoading,
    error,
    filters,
    updateFilter,
    resetFilters,
    sortKey,
    sortDir,
    toggleSort,
    page,
    setPage,
    totalPages,
    tipos,
    indexadores,
    fontes,
  } = useOfertas();

  const hasFilters = !!(filters.query || filters.tipo || filters.indexador || filters.fonte || filters.apenasComFgc || filters.apenasIsentoIr);

  const SortTh = ({ label, col, className = "" }: { label: string; col: SortKey; className?: string }) => (
    <th
      className={`font-dm-mono text-[10px] uppercase text-mono-600 tracking-widest bg-white border-b-2 border-btg-800 px-4 py-3 cursor-pointer select-none hover:text-btg-800 transition-colors whitespace-nowrap ${className}`}
      onClick={() => toggleSort(col)}
    >
      {label}
      <SortIcon active={sortKey === col} dir={sortDir} />
    </th>
  );

  const StaticTh = ({ label, className = "" }: { label: string; className?: string }) => (
    <th className={`font-dm-mono text-[10px] uppercase text-mono-600 tracking-widest bg-white border-b-2 border-btg-800 px-4 py-3 whitespace-nowrap ${className}`}>
      {label}
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Pesquisa */}
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-300" />
          <input
            type="text"
            placeholder="Pesquisar emissor, nome, tipo..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="w-full bg-mono-50 border border-mono-200 rounded-md py-2 pl-9 pr-3 font-sora text-[13px] text-mono-900 placeholder-mono-300 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
          />
        </div>

        {/* Tipo */}
        <select
          value={filters.tipo}
          onChange={(e) => updateFilter("tipo", e.target.value)}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-2 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          <option value="">Todos os tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Indexador */}
        <select
          value={filters.indexador}
          onChange={(e) => updateFilter("indexador", e.target.value)}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-2 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          <option value="">Todos os indexadores</option>
          {indexadores.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>

        {/* Fonte */}
        <select
          value={filters.fonte}
          onChange={(e) => updateFilter("fonte", e.target.value)}
          className="font-sora text-xs text-mono-900 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-2 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/20"
        >
          <option value="">Todas as fontes</option>
          {fontes.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Toggles FGC / Isento IR */}
        <button
          onClick={() => updateFilter("apenasComFgc", !filters.apenasComFgc)}
          className={`font-sora text-xs px-3 py-2 rounded-md border transition-colors ${
            filters.apenasComFgc
              ? "bg-btg-800 text-white border-btg-800"
              : "bg-mono-50 text-mono-600 border-mono-200 hover:border-btg-800"
          }`}
        >
          Com FGC
        </button>
        <button
          onClick={() => updateFilter("apenasIsentoIr", !filters.apenasIsentoIr)}
          className={`font-sora text-xs px-3 py-2 rounded-md border transition-colors ${
            filters.apenasIsentoIr
              ? "bg-btg-800 text-white border-btg-800"
              : "bg-mono-50 text-mono-600 border-mono-200 hover:border-btg-800"
          }`}
        >
          Isento IR
        </button>

        {/* Limpar filtros */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="font-sora text-xs px-3 py-2 rounded-md border border-mono-200 text-mono-600 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            Limpar
          </button>
        )}

        {/* Contador */}
        <span className="font-dm-mono text-xs text-mono-300 ml-auto whitespace-nowrap">
          {isLoading ? "Carregando..." : `${total.toLocaleString("pt-BR")} de ${totalAll.toLocaleString("pt-BR")} ativos`}
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-[#C0392B] text-sm font-sora p-3 bg-red-50 rounded-lg">
          <Warning size={16} />
          Erro ao carregar ofertas. Verifique a conexão com o servidor.
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white border border-mono-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <SortTh label="Emissor" col="emissor" />
                <SortTh label="Tipo" col="tipo" />
                <StaticTh label="Indexador" />
                <StaticTh label="Taxa" />
                <SortTh label="Taxa %" col="taxa_valor" />
                <SortTh label="Vencimento" col="data_vencimento" />
                <StaticTh label="FGC" />
                <StaticTh label="IR" />
                <StaticTh label="Fonte" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex items-center justify-center gap-2 text-btg-800">
                      <SpinnerGap size={20} className="animate-spin" />
                      <span className="font-sora text-sm text-mono-600">Carregando ofertas...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <EmptyState filtered={hasFilters} />
              ) : (
                data.map((row: OfertaSchema, i: number) => (
                  <tr
                    key={row.id}
                    className={`transition-colors duration-100 border-b border-mono-200 last:border-b-0 hover:bg-[#F2F5FC] ${
                      i % 2 === 0 ? "bg-white" : "bg-mono-50"
                    }`}
                  >
                    <td className="font-sora font-medium text-[13px] text-mono-900 px-4 py-3 max-w-[200px]">
                      <span className="block truncate" title={row.emissor ?? undefined}>{row.emissor ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.tipo ? <Badge tipo={row.tipo} /> : <span className="text-mono-300">—</span>}
                    </td>
                    <td className="font-sora text-xs text-mono-600 px-4 py-3 whitespace-nowrap">
                      {row.indexador ?? "—"}
                    </td>
                    <td className="font-dm-mono text-xs px-4 py-3 whitespace-nowrap" style={{ color: taxaColor(row.taxa_valor) }}>
                      {row.taxa_bruta ?? "—"}
                    </td>
                    <td
                      className="font-dm-mono font-medium text-[13px] px-4 py-3 whitespace-nowrap"
                      style={{ color: taxaColor(row.taxa_valor) }}
                    >
                      {row.taxa_valor != null ? `${row.taxa_valor.toFixed(2)}%` : "—"}
                    </td>
                    <td className="font-dm-mono text-xs text-mono-600 px-4 py-3 whitespace-nowrap">
                      {row.data_vencimento ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.com_fgc
                        ? <Check size={14} weight="bold" className="text-green-600" />
                        : <X size={14} weight="bold" className="text-mono-300" />}
                    </td>
                    <td className="px-4 py-3">
                      {row.isento_ir
                        ? <Check size={14} weight="bold" className="text-green-600" />
                        : <X size={14} weight="bold" className="text-mono-300" />}
                    </td>
                    <td className="font-sora text-xs text-mono-600 px-4 py-3 whitespace-nowrap">
                      {row.fonte}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-dm-mono text-xs text-mono-300">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 font-sora text-xs px-3 py-1.5 rounded-md border border-mono-200 text-mono-600 hover:border-btg-800 hover:text-btg-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={13} /> Anterior
            </button>

            {/* Páginas numéricas */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`font-dm-mono text-xs w-8 h-8 rounded-md border transition-colors ${
                      p === page
                        ? "bg-btg-800 text-white border-btg-800"
                        : "bg-white text-mono-600 border-mono-200 hover:border-btg-800 hover:text-btg-800"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 font-sora text-xs px-3 py-1.5 rounded-md border border-mono-200 text-mono-600 hover:border-btg-800 hover:text-btg-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
