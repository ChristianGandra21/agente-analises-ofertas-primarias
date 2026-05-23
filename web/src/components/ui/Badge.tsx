type TipoAtivo = "CDB" | "CRA" | "CRI" | "LCI" | "LCA" | "DEB";

const BADGE_STYLES: Record<TipoAtivo, string> = {
  CDB: "bg-[#E8EEF8] text-[#003087]",
  CRA: "bg-[#F5EDD6] text-[#8B6914]",
  CRI: "bg-[#F5EDD6] text-[#8B6914]",
  LCI: "bg-[#E8F5EE] text-[#0D7A4E]",
  LCA: "bg-[#EEF5E8] text-[#3A7A0D]",
  DEB: "bg-[#EDEEF2] text-[#6B6E7A]",
};

interface BadgeProps {
  tipo: string;
}

export function Badge({ tipo }: BadgeProps) {
  const upper = tipo.toUpperCase() as TipoAtivo;
  const style = BADGE_STYLES[upper] ?? "bg-[#EDEEF2] text-[#6B6E7A]";

  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 font-dm-mono text-[10px] font-medium uppercase ${style}`}
    >
      {tipo}
    </span>
  );
}
