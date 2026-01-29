"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askAI } from "@/app/lib/aiClient";
import { X } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  model?: string;
};

/**
 * In-memory, per-question chat cache
 * Keyed by questionId
 */
const chatCache = new Map<string, Message[]>();
const autoSent = new Set<string>();

export default function QuestionDrawer() {
  const router = useRouter();
  const { questionId } = useParams<{ questionId: string }>();
  const searchParams = useSearchParams();

  const questionText = searchParams.get("text") ?? "";
  const questionRole = searchParams.get("role") ?? "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- Restore cached chat ---------------- */
  useEffect(() => {
    if (!questionId) return;

    if (chatCache.has(questionId)) {
      setMessages(chatCache.get(questionId)!);
    } else {
      setMessages([]);
    }
  }, [questionId]);

  /* ---------------- Auto-send clicked question ---------------- */
  useEffect(() => {
    if (!questionId || !questionText) return;

    // If chat already exists, just restore it
    if (chatCache.has(questionId)) return;

    // Guard against duplicate auto-send
    if (autoSent.has(questionId)) return;

    autoSent.add(questionId);

    const base: Message[] = [{ role: "user", content: questionText }];

    setMessages(base);
    chatCache.set(questionId, base);

    runAI(base, questionText);
  }, [questionId, questionText]);

  async function runAI(base: Message[], text: string) {
    setLoading(true);

    const { reply, model } = await askAI(base, text, questionRole);

    const assistantMessage: Message = {
      role: "assistant",
      content: reply,
      model,
    };

    const updated = [...base, assistantMessage];

    setMessages(updated);
    chatCache.set(questionId, updated);
    setLoading(false);
  }

  const sendMessage = async () => {
    if (loading) return;
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");
    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const next = [...messages, userMessage];
    setMessages(next);
    chatCache.set(questionId, next);

    await runAI(next, text);
  };

  /* ---------------- Auto-scroll to bottom ---------------- */
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-panel)",
        }}
      >
        <h2 className="font-semibold">Question</h2>
        <button
          onClick={() => router.back()}
          className="opacity-70 hover:opacity-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* Question text (fixed, 2-line ellipsis) */}
      {questionText && (
        <div
          className="px-4 py-3 text-sm overflow-hidden"
          style={{
            maxHeight: "4em", // 2 lines × 1.5 line-height
            lineHeight: "1.5em",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-panel)",
          }}
        >
          <div className="line-clamp-2 break-words whitespace-normal">
            {questionText}
          </div>
        </div>
      )}

      {/* Chat (scrollable only area) */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="max-w-[80%] rounded p-3 text-sm"
            style={{
              marginLeft: msg.role === "user" ? "auto" : undefined,
              marginRight: msg.role === "assistant" ? "auto" : undefined,
              backgroundColor:
                msg.role === "user"
                  ? "var(--color-button-primary-bg)"
                  : "var(--color-panel)",
              border: "1px solid var(--color-border)",
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>

            {msg.model && (
              <div
                className="mt-1 text-right"
                style={{ fontSize: "10px", opacity: 0.6 }}
              >
                — {msg.model}
              </div>
            )}
          </div>
        ))}

        {loading && <p className="text-sm opacity-60">Thinking…</p>}
      </div>

      {/* Input (fixed at bottom) */}
      <div
        className="p-3 flex gap-2"
        style={{
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-panel)",
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 resize-none p-2 text-sm"
          placeholder="Ask anything about this question..."
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="btn-primary px-4 py-2 text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
