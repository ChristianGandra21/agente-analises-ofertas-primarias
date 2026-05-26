"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { getOfertas } from "@/lib/api";
import type { OfertaSchema } from "@/lib/types";

export type SortKey = "taxa_valor" | "data_vencimento" | "emissor" | "tipo";
export type SortDir = "asc" | "desc";

export interface OfertasFilters {
  query: string;
  tipo: string;
  indexador: string;
  fonte: string;
  apenasComFgc: boolean;
  apenasIsentoIr: boolean;
}

const PAGE_SIZE = 50;

export function useOfertas() {
  const [filters, setFilters] = useState<OfertasFilters>({
    query: "",
    tipo: "",
    indexador: "",
    fonte: "",
    apenasComFgc: false,
    apenasIsentoIr: false,
  });
  const [sortKey, setSortKey] = useState<SortKey>("taxa_valor");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Busca todas as ofertas do banco (sem filtro server-side para permitir filtro client-side)
  const { data: todas, isLoading, error, mutate } = useSWR(
    "/api/ofertas?limit=9999&apenas_com_taxa=false",
    () => getOfertas({ limite: 9999 }),
    { revalidateOnFocus: false }
  );

  const filtered = useMemo(() => {
    if (!todas) return [];

    let result = [...todas];

    // Filtro textual (emissor, nome, tipo, indexador, fonte)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (o) =>
          o.emissor?.toLowerCase().includes(q) ||
          o.nome?.toLowerCase().includes(q) ||
          o.tipo?.toLowerCase().includes(q) ||
          o.indexador?.toLowerCase().includes(q) ||
          o.fonte?.toLowerCase().includes(q)
      );
    }

    // Filtros de seleção
    if (filters.tipo) result = result.filter((o) => o.tipo?.toLowerCase().includes(filters.tipo.toLowerCase()));
    if (filters.indexador) result = result.filter((o) => o.indexador?.toLowerCase().includes(filters.indexador.toLowerCase()));
    if (filters.fonte) result = result.filter((o) => o.fonte === filters.fonte);
    if (filters.apenasComFgc) result = result.filter((o) => o.com_fgc === true);
    if (filters.apenasIsentoIr) result = result.filter((o) => o.isento_ir === true);

    // Ordenação
    result.sort((a, b) => {
      let valA: string | number | null = null;
      let valB: string | number | null = null;

      switch (sortKey) {
        case "taxa_valor":
          valA = a.taxa_valor ?? -1;
          valB = b.taxa_valor ?? -1;
          break;
        case "data_vencimento":
          valA = a.data_vencimento ?? "";
          valB = b.data_vencimento ?? "";
          break;
        case "emissor":
          valA = a.emissor ?? "";
          valB = b.emissor ?? "";
          break;
        case "tipo":
          valA = a.tipo ?? "";
          valB = b.tipo ?? "";
          break;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA);
      const strB = String(valB);
      return sortDir === "asc"
        ? strA.localeCompare(strB, "pt-BR")
        : strB.localeCompare(strA, "pt-BR");
    });

    return result;
  }, [todas, filters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Valores únicos para os selects de filtro
  const tipos = useMemo(
    () => [...new Set((todas ?? []).map((o) => o.tipo).filter(Boolean))].sort() as string[],
    [todas]
  );
  const indexadores = useMemo(
    () => [...new Set((todas ?? []).map((o) => o.indexador).filter(Boolean))].sort() as string[],
    [todas]
  );
  const fontes = useMemo(
    () => [...new Set((todas ?? []).map((o) => o.fonte).filter(Boolean))].sort() as string[],
    [todas]
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function updateFilter<K extends keyof OfertasFilters>(key: K, value: OfertasFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({ query: "", tipo: "", indexador: "", fonte: "", apenasComFgc: false, apenasIsentoIr: false });
    setPage(1);
  }

  return {
    data: paginated,
    total: filtered.length,
    totalAll: todas?.length ?? 0,
    isLoading,
    error,
    mutate,
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
  };
}
