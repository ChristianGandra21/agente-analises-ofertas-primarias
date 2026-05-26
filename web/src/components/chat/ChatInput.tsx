"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react";

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInput: (val: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, loading, onInput, onSend }: ChatInputProps) {
  return (
    <div className="flex gap-3 items-end">
      <textarea
        value={input}
        onChange={(e) => onInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Digite sua pergunta sobre renda fixa..."
        rows={1}
        className="flex-1 resize-none bg-mono-50 border border-mono-100 rounded-xl px-4 py-3 font-sora text-sm text-mono-900 placeholder:text-mono-300 focus:outline-none focus:border-btg-800 focus:ring-2 focus:ring-btg-800/8 transition-all"
        style={{ maxHeight: "120px" }}
      />
      <button
        onClick={onSend}
        disabled={!input.trim() || loading}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-btg-800 text-white font-sora font-medium text-sm hover:bg-btg-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <PaperPlaneTilt size={16} weight="fill" />
        Enviar
      </button>
    </div>
  );
}
