import useSWR from "swr";
import { getOfertas, getMacro, getStatus } from "@/lib/api";

export function useOverview() {
  const { data: macro } = useSWR("/api/macro", getMacro, {
    refreshInterval: 60000,
  });
  const { data: ofertas } = useSWR(
    "/api/ofertas?limite=10",
    () => getOfertas({ limite: 10 }),
    { refreshInterval: 30000 }
  );
  const { data: status } = useSWR("/api/status", getStatus);

  return { macro, ofertas, status };
}
