"use client";

import { useState, useEffect, useRef } from "react";
import { chatAgente } from "@/lib/api";
import type { ChatResponse } from "@/lib/types";

export interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: string;
  agentes?: string[];
  duracao?: number;
}

export function useChat(initialQuestion?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuestion) handleSend(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(pergunta?: string) {
    const text = (pergunta ?? input).trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    const ts = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: ts },
    ]);

    const start = Date.now();
    try {
      const data: ChatResponse = await chatAgente(text);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.resposta,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          agentes: data.agentes_acionados,
          duracao: parseFloat(((Date.now() - start) / 1000).toFixed(1)),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Erro ao consultar o agente. Tente novamente.",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return { messages, input, setInput, loading, handleSend, bottomRef };
}
