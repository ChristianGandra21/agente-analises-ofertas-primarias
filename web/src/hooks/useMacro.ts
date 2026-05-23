import useSWR from "swr";

interface MacroItem {
  serie: string;
  valor: number;
  data: string;
}

interface HistoricoSerie {
  data: string;
  valor: number;
}

type HistoricoData = Record<string, HistoricoSerie[]>;

interface ContextoItem {
  id: number;
  tipo: string | null;
  instituicao: string | null;
  data_referencia: string | null;
  resumo_estrategia: string | null;
  fonte_url: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMacro() {
  const { data: atual } = useSWR<MacroItem[]>("/api/macro", fetcher, {
    refreshInterval: 60000,
  });

  const { data: historico } = useSWR<HistoricoData>(
    "/api/macro/historico?series=selic,ipca&limite=30",
    fetcher
  );

  const { data: contexto } = useSWR<ContextoItem[]>(
    "/api/contexto?limite=9",
    fetcher
  );

  // Merge selic and ipca into chart-friendly format
  const chartData =
    historico?.selic && historico?.ipca
      ? historico.selic.map((s, i) => ({
          data: s.data,
          selic: s.valor * 100 * 252,
          ipca: (historico.ipca[i]?.valor ?? 0) * 100,
        }))
      : [];

  return { atual, chartData, contexto };
}
