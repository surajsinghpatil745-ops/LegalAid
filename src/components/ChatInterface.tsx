"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import LanguagePicker from "@/components/LanguagePicker";
import type { ChatResponse } from "@/lib/legal-engine";
import {
  getWelcomeMessage,
  getQuickPrompts,
  getInputPlaceholder,
  getLanguageLabel,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "@/lib/languages";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: Partial<ChatResponse> & { aiPowered?: boolean };
  timestamp: Date;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function renderInline(text: string, key: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${key}-${i}`} className="font-semibold text-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${key}-${i}`}>{part}</span>;
  });
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2, -2).includes("**")) {
      return (
        <p key={i} className="mb-2 mt-4 text-sm font-bold text-navy first:mt-0">
          {trimmed.slice(2, -2)}
        </p>
      );
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={i} className="mb-1.5 mt-3 text-sm font-semibold text-navy">
          {trimmed.replace("### ", "")}
        </h4>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={i} className="mb-2 mt-4 text-base font-bold text-navy first:mt-0">
          {trimmed.replace("## ", "")}
        </h3>
      );
    }

    if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
      return (
        <p key={i} className="mb-1.5 ml-1 text-sm leading-relaxed text-slate-700">
          <span className="mr-1.5 text-saffron-dark">•</span>
          {renderInline(trimmed.replace(/^[•-]\s*/, ""), `bullet-${i}`)}
        </p>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const [num, ...rest] = trimmed.split(/\.\s/);
      return (
        <p key={i} className="mb-2 text-sm leading-relaxed text-slate-700">
          <span className="mr-2 font-semibold text-navy">{num}.</span>
          {renderInline(rest.join(". "), `num-${i}`)}
        </p>
      );
    }

    if (trimmed === "") return <div key={i} className="h-2" />;

    return (
      <p key={i} className="mb-1.5 text-sm leading-relaxed text-slate-700">
        {renderInline(line, `line-${i}`)}
      </p>
    );
  });
}

function BotAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-saffron-dark text-white shadow-sm`}
    >
      ⚖
    </div>
  );
}

function createWelcomeMessage(language: Language): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: getWelcomeMessage(language),
    timestamp: new Date(),
  };
}

export default function ChatInterface() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setAiEnabled(d.aiEnabled))
      .catch(() => setAiEnabled(false));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (saved === "english" || saved === "hindi" || saved === "marathi") {
      setLanguage(saved);
      setMessages([createWelcomeMessage(saved)]);
    }
  }, []);

  function selectLanguage(lang: Language) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    setLanguage(lang);
    setMessages([createWelcomeMessage(lang)]);
    setInput("");
  }

  function changeLanguage() {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    setLanguage(null);
    setMessages([]);
    setInput("");
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streaming]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!language || !text.trim() || loading || streaming) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setLoading(true);

      const history = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        if (aiEnabled) {
          // Try streaming AI response first
          setStreaming(true);
          setLoading(false);

          const assistantId = `assistant-${Date.now()}`;
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: "",
              timestamp: new Date(),
            },
          ]);

          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: history, stream: true, language }),
            });

            if (!res.ok || !res.body) throw new Error("Stream failed");

            const metaHeader = res.headers.get("X-Chat-Meta");
            const meta = metaHeader
              ? (JSON.parse(decodeURIComponent(metaHeader)) as Partial<ChatResponse>)
              : undefined;

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              fullContent += decoder.decode(value, { stream: true });
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fullContent, meta: { ...meta, aiPowered: true } }
                    : m
                )
              );
            }
          } catch {
            // Fallback to non-streaming (handles quota errors gracefully)
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: history, stream: false, language }),
            });
            const data = await res.json();
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: data.message,
                      meta: { ...data, aiPowered: data.aiPowered ?? false },
                    }
                  : m
              )
            );
          }

          setStreaming(false);
        } else {
          // Rule-based fallback
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text.trim(), language }),
          });
          const data = await res.json();

          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: data.message,
              meta: { ...data, aiPowered: false },
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, something went wrong. Please try again or browse our [situation guides](/#scenarios).",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
        setStreaming(false);
        inputRef.current?.focus();
      }
    },
    [messages, loading, streaming, aiEnabled, language]
  );

  function clearChat() {
    if (!language) return;
    setMessages([createWelcomeMessage(language)]);
  }

  const quickPrompts = language ? getQuickPrompts(language) : [];

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-navy to-navy-light px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <BotAvatar />
          <div>
            <h2 className="text-sm font-semibold text-white">LegalAID Bot</h2>
            <p className="flex items-center gap-1.5 text-xs text-slate-300">
              <span
                className={`inline-block h-2 w-2 rounded-full ${loading || streaming ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`}
              />
              {loading || streaming
                ? "Typing..."
                : aiEnabled
                  ? "AI-powered · Online"
                  : "Guided mode · Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {language && (
            <button
              onClick={changeLanguage}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {getLanguageLabel(language)} · Change
            </button>
          )}
          {language && (
            <button
              onClick={clearChat}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      {!language ? (
        <LanguagePicker onSelect={selectLanguage} />
      ) : (
        <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">
        <div className="mx-auto max-w-2xl space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "assistant" && <BotAvatar size="sm" />}

              <div
                className={`flex max-w-[90%] flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-navy text-white"
                      : "rounded-tl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"
                  } ${msg.role === "assistant" ? "max-w-full sm:min-w-[280px]" : ""}`}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-sm leading-relaxed">{renderMarkdown(msg.content)}</div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}

                  {msg.meta?.relatedScenario && msg.content && (
                    <Link
                      href={`/scenarios/${msg.meta.relatedScenario}`}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron-dark transition-colors hover:bg-saffron/20"
                    >
                      📖 View full guide →
                    </Link>
                  )}

                  {msg.meta?.suggestLawyer && msg.content && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-medium text-amber-800">
                        This may need professional help
                      </p>
                      <Link
                        href="/lawyers"
                        className="mt-1 inline-block text-xs font-semibold text-amber-900 hover:underline"
                      >
                        Find legal agencies →
                      </Link>
                    </div>
                  )}
                </div>

                <span className="mt-1 px-1 text-[10px] text-slate-400">
                  {formatTime(msg.timestamp)}
                  {msg.meta?.aiPowered && " · AI"}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <BotAvatar size="sm" />
              <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-saffron [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-saffron [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-saffron" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && !loading && (
        <div className="border-t border-slate-100 bg-white px-4 py-3">
          <p className="mb-2 text-xs font-medium text-slate-500">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition-all hover:border-saffron hover:bg-saffron/5 hover:text-saffron-dark"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-slate-200 bg-white p-4"
      >
        {!aiEnabled && aiEnabled !== null && (
          <p className="mx-auto mb-2 max-w-2xl text-center text-[11px] text-slate-400">
            Running in guided mode. Add a Gemini or OpenAI API key to enable AI chatbot.{" "}
            <Link href="/lawyers" className="text-saffron-dark hover:underline">
              Find legal help
            </Link>
          </p>
        )}
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getInputPlaceholder(language)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-saffron focus:bg-white focus:ring-2 focus:ring-saffron/20"
            disabled={loading || streaming}
          />
          <button
            type="submit"
            disabled={loading || streaming || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-saffron px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-saffron-dark disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.652 60.652 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.717 60.717 0 0 0 3.478 2.404Z" />
            </svg>
            Send
          </button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
