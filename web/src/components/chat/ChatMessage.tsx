"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ChartBar, Globe } from "@phosphor-icons/react";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
  timestamp: string;
  agentes?: string[];
  duracao?: number;
}

export function ChatMessage({ role, content, timestamp, agentes, duracao }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-2`}
    >
      <div
        className={
          isUser
            ? "max-w-[70%] bg-btg-800 text-white rounded-2xl rounded-br-sm px-4 py-3 font-sora text-[13px] leading-relaxed"
            : "max-w-[80%] bg-white border border-mono-200 rounded-2xl rounded-bl-sm px-4 py-3 font-sora text-[13px] text-mono-900 leading-relaxed shadow-sm"
        }
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            components={{
              strong: ({ children }) => (
                <strong className="font-semibold text-btg-800">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mt-2">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="text-mono-700 text-sm">{children}</li>
              ),
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>

      <div className={`flex items-center gap-2 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
        <span className="font-dm-mono text-[10px] text-mono-300">{timestamp}</span>
      </div>

      {!isUser && agentes && agentes.length > 0 && (
        <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-mono-100">
          <span className="font-dm-mono text-[10px] text-mono-300">Consultou:</span>
          {agentes.includes("analista") && (
            <span className="flex items-center gap-1 text-xs font-sora text-mono-600">
              <ChartBar size={12} /> Analista
            </span>
          )}
          {agentes.includes("contextualista") && (
            <span className="flex items-center gap-1 text-xs font-sora text-mono-600">
              <Globe size={12} /> Contextualista
            </span>
          )}
          {duracao != null && (
            <span className="font-dm-mono text-[10px] text-mono-300 ml-auto">
              {duracao.toFixed(1)}s
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
