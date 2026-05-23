"use client";

import { House, Scales, Robot, ChartLine, ArrowsClockwise } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Visão Geral", icon: House, href: "/overview" },
  { label: "Comparador", icon: Scales, href: "/comparador" },
  { label: "Agente", icon: Robot, href: "/agente" },
  { label: "Macro", icon: ChartLine, href: "/macro" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-h-screen bg-btg-900 flex flex-col shrink-0">
      <div className="px-5 pt-6 pb-8">
        <p className="font-dm-mono text-[10px] uppercase tracking-wider text-white/60">
          BTG PACTUAL
        </p>
        <h1 className="font-sora font-semibold text-base text-white leading-tight mt-1">
          Ofertas Primárias
        </h1>
        <p className="font-dm-mono text-[10px] text-white/40 mt-0.5">
          Terminal v1.0
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} />
              <span className="font-sora text-[13px]">{label}</span>
            </a>
          );
        })}
      </nav>

      <div className="px-5 py-6 border-t border-white/10">
        <p className="font-dm-mono text-[10px] uppercase tracking-wider text-white/40">
          ÚLTIMA COLETA
        </p>
        <p className="font-dm-mono text-[11px] text-white/70 mt-1">
          21/05/2026 16:30
        </p>
        <button className="flex items-center justify-center gap-2 w-full mt-4 bg-btg-700 hover:bg-btg-800 text-white text-xs font-sora font-medium rounded-md py-2.5 transition-colors duration-150">
          <ArrowsClockwise size={14} />
          Atualizar dados
        </button>
      </div>
    </aside>
  );
}
