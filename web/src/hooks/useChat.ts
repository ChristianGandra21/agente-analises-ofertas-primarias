"use client";

import { useState, useCallback, useRef } from "react";

export interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: string;
  agentes?: string[];
  duracao?: number;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const handleSend = useCallback(
    async (pergunta?: string) => {
      const text = (pergunta ?? input).trim();
      if (!text || loadingRef.current) return;

      setInput("");
      setLoading(true);
      loadingRef.current = true;

      const userMsg: Message = {
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const start = Date.now();
        const res = await fetch("/api/agente/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pergunta: text }),
        });
        const data = await res.json();

        const agentMsg: Message = {
          role: "agent",
          content: data.resposta ?? data.detail ?? "Erro ao obter resposta.",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          agentes: data.agentes_acionados ?? ["analista", "contextualista"],
          duracao: data.duracao_segundos ?? ((Date.now() - start) / 1000),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } catch {
        const agentMsg: Message = {
          role: "agent",
          content: "Desculpe, não foi possível obter uma resposta no momento. Tente novamente.",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          agentes: [],
          duracao: 0,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [input]
  );

  return { messages, input, setInput, loading, handleSend };
}
