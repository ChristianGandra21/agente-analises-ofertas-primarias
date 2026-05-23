import useSWR from "swr";
import { getMacro, getMacroHistorico, getOfertas, getStatus } from "@/lib/api";

export function useOverview() {
  const { data: status, isLoading: loadingStatus, error: errStatus } =
    useSWR("/api/status", getStatus, { refreshInterval: 30_000 });

  const { data: macro, isLoading: loadingMacro, error: errMacro } =
    useSWR("/api/macro", getMacro, { refreshInterval: 60_000 });

  // Busca os últimos 2 valores de selic e ipca para calcular variação real
  const { data: historicoMacro, isLoading: loadingHist } =
    useSWR(
      "/api/macro/historico?series=selic,ipca&limite=2",
      () => getMacroHistorico("selic,ipca", 2),
      { refreshInterval: 300_000 }
    );

  const { data: ofertas, isLoading: loadingOfertas, error: errOfertas } =
    useSWR("/api/ofertas?limite=10", () => getOfertas({ limite: 10 }), {
      refreshInterval: 30_000,
    });

  return {
    status,
    macro,
    historicoMacro,
    ofertas,
    loading: loadingStatus || loadingMacro || loadingHist || loadingOfertas,
    error: errStatus || errMacro || errOfertas,
  };
}
