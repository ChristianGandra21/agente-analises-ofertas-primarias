"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Robot } from "@phosphor-icons/react";
import { ChatMessage } from "./ChatMessage";
import { SuggestedQuestions } from "./SuggestedQuestions";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: string;
  agentes?: string[];
  duracao?: number;
}

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  onSuggested: (q: string) => void;
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start mb-2"
    >
      <div className="bg-white border border-mono-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <span className="font-dm-mono text-xs text-mono-300 mr-2">Analisando</span>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-btg-800 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ChatWindow({ messages, loading, onSuggested }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16">
        <div className="w-16 h-16 rounded-2xl bg-[#E8EEF8] flex items-center justify-center">
          <Robot size={32} className="text-btg-800" weight="duotone" />
        </div>
        <div className="text-center">
          <p className="font-sora font-medium text-mono-900 mb-1">
            Bem-vindo ao Agente BTG
          </p>
          <p className="font-sora text-sm text-mono-600">
            Faça uma pergunta sobre o mercado de renda fixa
          </p>
        </div>
        <SuggestedQuestions onSelect={onSuggested} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 scroll-smooth"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#EDEEF2 transparent",
      }}
    >
      {messages.map((msg, i) => (
        <ChatMessage key={i} {...msg} />
      ))}
      <AnimatePresence>
        {loading && <TypingIndicator />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
