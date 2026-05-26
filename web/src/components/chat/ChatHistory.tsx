"use client";

import { Plus } from "@phosphor-icons/react";
import type { ConversationItem } from "@/lib/types";

interface ChatHistoryProps {
  conversations: ConversationItem[];
  activeId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
  onNew: () => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function ChatHistory({ conversations, activeId, loading, onSelect, onNew }: ChatHistoryProps) {
  return (
    <div className="flex flex-col h-full bg-white border border-mono-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-mono-200">
        <span className="font-sora text-xs uppercase tracking-widest text-mono-500">Conversas</span>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1.5 text-xs font-sora text-btg-800 hover:text-btg-700"
        >
          <Plus size={14} weight="bold" />
          Nova
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {loading && (
          <div className="px-4 py-3 text-xs font-dm-mono text-mono-400">Carregando...</div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="px-4 py-3 text-xs font-sora text-mono-500">Nenhuma conversa ainda.</div>
        )}
        {conversations.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={
                "w-full text-left px-4 py-3 border-b border-mono-100 transition-colors " +
                (isActive ? "bg-[#F2F5FC]" : "hover:bg-mono-50")
              }
            >
              <div className="font-sora text-sm text-mono-900 truncate">{c.titulo}</div>
              <div className="flex items-center justify-between text-[11px] text-mono-400 mt-1 font-dm-mono">
                <span>{c.total_mensagens} msgs</span>
                <span>{formatDate(c.atualizado_em)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
