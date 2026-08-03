"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, RefreshCw } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: string[];
};

type AskResponse = {
  answer: string;
  sources: string[];
  matched: boolean;
  knowledge_updated_at: string;
  chunk_count: number;
};

const SUGGESTIONS = [
  "What are the manifesto pillars?",
  "Tell me about education plans",
  "What is the vision?",
  "How will roads be fixed?",
  "What about healthcare?",
];

function formatBotText(text: string) {
  // Light markdown: **bold** and newlines
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ManifestoChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi — I'm the manifesto assistant. Ask about any commitment, pillar, vision, or mission. My answers update automatically whenever the manifesto is edited in Admin → Content.",
    },
  ]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const ask = useCallback(async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;

    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: q }]);
    setInput("");
    setBusy(true);

    try {
      const res = await apiFetch<AskResponse>("/manifesto-bot/ask", {
        method: "POST",
        body: { question: q },
      });
      setLastSync(res.knowledge_updated_at);
      setMessages((m) => [
        ...m,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: res.answer,
          sources: res.sources,
        },
      ]);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "I couldn't reach the manifesto service. Please try again in a moment.";
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: "bot", text: msg }]);
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105",
          open ? "bg-ink-900 text-parchment-50" : "bg-forest-600 text-white"
        )}
        aria-label={open ? "Close manifesto chat" : "Open manifesto chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(560px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-ink-900/10 bg-parchment-50 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-ink-950 px-4 py-3 text-parchment-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-600/30 ring-1 ring-forest-500/40">
              <Bot className="h-4 w-4 text-gold-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Manifesto Assistant</p>
              <p className="truncate text-[10px] text-parchment-100/60">
                Live knowledge · updates when content changes
              </p>
            </div>
            {lastSync && (
              <span className="flex items-center gap-1 text-[9px] text-parchment-100/50" title={lastSync}>
                <RefreshCw className="h-3 w-3" />
                synced
              </span>
            )}
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-md bg-forest-600 text-white"
                      : "rounded-bl-md bg-parchment-100 text-graphite-700 ring-1 ring-ink-900/5"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.role === "bot" ? formatBotText(m.text) : m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <p className="mt-2 border-t border-ink-900/5 pt-1.5 text-[10px] text-graphite-500">
                      Sources: {m.sources.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-parchment-100 px-3 py-2 text-[12px] text-graphite-500 ring-1 ring-ink-900/5">
                  Looking up the latest manifesto…
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 border-t border-ink-900/5 px-3 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => ask(s)}
                  className="rounded-full border border-ink-900/10 bg-white px-2.5 py-1 text-[10px] text-graphite-600 hover:border-forest-600/40 hover:text-forest-700"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            className="flex gap-2 border-t border-ink-900/10 bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the manifesto…"
              disabled={busy}
              className="flex-1 rounded-lg border border-ink-900/10 bg-parchment-50 px-3 py-2 text-sm outline-none placeholder:text-graphite-500 focus:border-forest-600"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-lg bg-forest-600 px-3 py-2 text-white hover:bg-forest-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
