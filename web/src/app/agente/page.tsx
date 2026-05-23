"use client";

import { motion } from "framer-motion";
import { StatusPill } from "@/components/ui/StatusPill";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";

export default function AgentePage() {
  const { messages, input, setInput, loading, handleSend } = useChat();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-6 shrink-0">
        <div>
          <h1 className="font-sora font-semibold text-2xl text-mono-900">
            Agente BTG
          </h1>
          <p className="font-sora text-sm text-mono-600 mt-1">
            Análise inteligente de renda fixa
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <StatusPill status="online" />
          <span className="font-dm-mono text-[11px] text-mono-600 bg-mono-50 border border-mono-200 rounded-md px-2.5 py-1">
            LLaMA 3.3 · Groq
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white border border-mono-200 rounded-xl overflow-hidden">
        <ChatWindow messages={messages} loading={loading} onSuggested={handleSend} />

        <div className="border-t border-mono-200 px-6 py-4">
          <ChatInput
            input={input}
            loading={loading}
            onInput={setInput}
            onSend={() => handleSend()}
          />
        </div>
      </div>
    </motion.div>
  );
}
