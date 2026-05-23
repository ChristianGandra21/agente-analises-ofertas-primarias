"use client";

import { useState, useEffect } from "react";
import { chatAgente, criarConversa, listarConversas, listarMensagens } from "@/lib/api";
import type { ChatResponse, ConversationItem, ChatMessageItem } from "@/lib/types";

export interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: string;
  agentes?: string[];
  duracao?: number;
}

export function useChat(initialQuestion?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function mapMessage(item: ChatMessageItem): Message {
    return {
      role: item.role,
      content: item.content,
      timestamp: formatTime(item.timestamp),
      agentes: item.agentes_acionados,
      duracao: item.duracao_segundos ?? undefined,
    };
  }

  useEffect(() => {
    refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialQuestion) handleSend(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  async function refreshConversations(selectId?: number) {
    setLoadingConversations(true);
    try {
      const data = await listarConversas();
      setConversations(data);
      const nextActive =
        selectId != null ? selectId : activeConversationId ?? (data[0]?.id ?? null);
      if (nextActive != null) {
        setActiveConversationId(nextActive);
        if (selectId != null || !activeConversationId) {
          await loadMessages(nextActive);
        }
      }
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadMessages(conversaId: number) {
    setLoadingMessages(true);
    try {
      const data = await listarMensagens(conversaId);
      setMessages(data.map(mapMessage));
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSelectConversation(conversaId: number) {
    setActiveConversationId(conversaId);
    await loadMessages(conversaId);
  }

  async function handleNewConversation(title?: string) {
    const convo = await criarConversa(title);
    setActiveConversationId(convo.id);
    setMessages([]);
    await refreshConversations(convo.id);
  }

  async function handleSend(pergunta?: string) {
    const text = (pergunta ?? input).trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    const ts = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: ts }]);

    const start = Date.now();
    try {
      let conversaId = activeConversationId;
      if (!conversaId) {
        const convo = await criarConversa(text.slice(0, 80));
        conversaId = convo.id;
        setActiveConversationId(convo.id);
      }

      const data: ChatResponse = await chatAgente(text, conversaId);
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
      await refreshConversations(conversaId ?? undefined);
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

  return {
    messages,
    input,
    setInput,
    loading,
    loadingConversations,
    loadingMessages,
    conversations,
    activeConversationId,
    handleSend,
    handleNewConversation,
    handleSelectConversation,
  };
}
