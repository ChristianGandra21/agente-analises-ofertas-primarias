"use client";

import { useEffect, useState } from "react";

function formatDate(date: Date): string {
  const months = [
    "jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
    "jul.", "ago.", "set.", "out.", "nov.", "dez.",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} de ${year}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function TopBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-10 bg-white border-b border-mono-200 flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-dm-mono text-[11px] text-mono-600 uppercase tracking-wide">
          B3 · RENDA FIXA
        </span>
        <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
        <span className="font-sora text-[11px] text-green-600 font-medium">
          Mercado aberto
        </span>
      </div>
      <div className="font-dm-mono text-[11px] text-mono-600">
        {formatDate(now)} &nbsp; {formatTime(now)}
      </div>
    </header>
  );
}
