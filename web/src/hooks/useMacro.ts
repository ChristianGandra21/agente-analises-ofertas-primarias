import useSWR from "swr";
import { getMacro, getMacroHistorico, getContexto } from "@/lib/api";

export function useMacroPage() {
  const { data: atual, isLoading: loadingAtual, error: errAtual } =
    useSWR("/api/macro", getMacro, { refreshInterval: 60_000 });

  const { data: historico, isLoading: loadingHist, error: errHist } =
    useSWR("/api/macro/historico", () => getMacroHistorico("selic,ipca", 30), {
      refreshInterval: 300_000,
    });

  const { data: contexto, isLoading: loadingCtx, error: errCtx } =
    useSWR("/api/contexto?limite=9", () => getContexto("", 9));

  const chartData =
    historico?.selic && historico?.ipca
      ? historico.selic.map((s, i) => ({
          data: s.data,
          selic: s.valor,
          ipca: historico.ipca[i]?.valor ?? 0,
        }))
      : [];

  return {
    atual,
    chartData,
    contexto,
    loading: loadingAtual || loadingHist || loadingCtx,
    error: errAtual || errHist || errCtx,
  };
}
