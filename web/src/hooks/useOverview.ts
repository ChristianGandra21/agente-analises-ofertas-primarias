import useSWR from "swr";
import { getMacro, getOfertas, getStatus } from "@/lib/api";

export function useOverview() {
  const { data: status, isLoading: loadingStatus, error: errStatus } =
    useSWR("/api/status", getStatus, { refreshInterval: 30_000 });

  const { data: macro, isLoading: loadingMacro, error: errMacro } =
    useSWR("/api/macro", getMacro, { refreshInterval: 60_000 });

  const { data: ofertas, isLoading: loadingOfertas, error: errOfertas } =
    useSWR("/api/ofertas?limite=10", () => getOfertas({ limite: 10 }), {
      refreshInterval: 30_000,
    });

  return {
    status,
    macro,
    ofertas,
    loading: loadingStatus || loadingMacro || loadingOfertas,
    error: errStatus || errMacro || errOfertas,
  };
}
