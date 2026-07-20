"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Check,
  Clock3,
  Download,
  FileSearch,
  FileText,
  MapPinned,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { catalystApiBase } from "@/lib/intelligence";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

type MessageSender = "bot" | "user";

type ChatInsight = {
  intent: string;
  confidence: string;
  source: string;
  metrics: Array<{ label: string; value: string | number }>;
  references: Array<{ type: string; id: string; title: string; detail: string }>;
  reasoning: string[];
  followUps: string[];
};

type ChatMessage = {
  id: number;
  sender: MessageSender;
  text: string;
  timestamp: string;
  hasCard?: boolean;
  intelligence?: ChatInsight;
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    text: "KrimeAI Node Initialized. Ready for queries.",
    timestamp: "10:00:01",
  },
];

const suggestions = [
  "Find similar cases for cyber crime",
  "Suggest investigative leads",
  "Build a case timeline",
  "Show socio-demographic insights",
];

const formatTimestamp = () =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

export default function Chat() {
  const reduceMotion = useReducedMotion();
  const { data } = useLiveIntelligence();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const messageId = useRef(2);
  const downloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [isResponding, messages, reduceMotion]);

  useEffect(
    () => () => {
      if (downloadTimer.current) clearTimeout(downloadTimer.current);
    },
    [],
  );

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = draft.trim();

    if (!query || isResponding) return;

    const userMessage: ChatMessage = {
      id: messageId.current++,
      sender: "user",
      text: query,
      timestamp: formatTimestamp(),
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsResponding(true);

    try {
      const history = messages.slice(-8).map((message) => ({ sender: message.sender, text: message.text }));
      const response = await fetch(`${catalystApiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || result.error || "Catalyst query failed");
      setMessages((current) => [
        ...current,
        {
          id: messageId.current++,
          sender: "bot",
          text: result.answer,
          timestamp: formatTimestamp(),
          hasCard: true,
          intelligence: result,
        },
      ]);
    } catch (caught) {
      setMessages((current) => [...current, { id: messageId.current++, sender: "bot", text: caught instanceof Error ? caught.message : "Unable to reach Catalyst.", timestamp: formatTimestamp() }]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setDraft("");
      event.currentTarget.blur();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setDraft(suggestion);
    inputRef.current?.focus();
  };

  const downloadTranscript = () => {
    const transcript = [
      "KRIMEAI INTELLIGENCE TRANSCRIPT",
      `Local session · ${data?.source || "Catalyst"}`,
      "",
      ...messages.map((message) => {
        const speaker = message.sender === "bot" ? "KrimeAI" : "Officer";
        const insight = message.intelligence
          ? `\n    Intent: ${message.intelligence.intent}\n    Confidence: ${message.intelligence.confidence}\n    Evidence: ${message.intelligence.references.map((item) => `${item.type} ${item.id}`).join(", ") || "None"}`
          : "";
        return `[${message.timestamp}] ${speaker}\n${message.text}${insight}`;
      }),
    ].join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    anchor.href = url;
    anchor.download = `krimeai-transcript-${date}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);

    setDownloaded(true);
    if (downloadTimer.current) clearTimeout(downloadTimer.current);
    downloadTimer.current = setTimeout(() => {
      setDownloaded(false);
      downloadTimer.current = null;
    }, 1800);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: reduceMotion ? 0 : 0.11,
            delayChildren: reduceMotion ? 0 : 0.04,
          },
        },
      }}
      className="space-y-5 sm:space-y-6"
    >
      <motion.header
        variants={{
          hidden: reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 18, filter: "blur(5px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
        transition={{ duration: reduceMotion ? 0.12 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#858e98]">
            <span className="live-dot size-2 rounded-full bg-[#287a71]" />
            Intelligence desk
          </div>
          <h1 className="text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-none tracking-[-0.06em] text-[#182033]">
            Ask KrimeAI.
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#737b86] sm:text-sm">
            Explore case records, surface patterns, and prepare an investigative line of enquiry in one secure workspace.
          </p>
        </div>

        <motion.div
          whileHover={reduceMotion ? undefined : { y: -2 }}
          className="flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3 py-2 text-[10px] font-semibold text-[#65707b] shadow-sm"
        >
          <ShieldCheck size={13} className="text-[#287a71]" />
          Local secure session
        </motion.div>
      </motion.header>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-6">
        <motion.section
          variants={{
            hidden: reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 24, scale: 0.985, filter: "blur(7px)" },
            visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
          }}
          transition={{ duration: reduceMotion ? 0.12 : 0.64, ease: [0.22, 1, 0.36, 1] }}
          className="dashboard-surface flex min-h-[590px] flex-col rounded-[28px] sm:rounded-[34px] xl:h-[calc(100dvh-13.75rem)] xl:min-h-[590px]"
          aria-labelledby="chat-title"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            style={{ position: "absolute" }}
          >
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, 34, -12, 0], y: [0, -18, 12, 0], scale: [1, 1.08, 0.96, 1] }
              }
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-20 -top-24 size-64 rounded-full bg-[#cbdce9]/45 blur-3xl"
            />
            <motion.div
              animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute -bottom-24 left-1/4 size-56 rounded-full bg-[#fbeae5]/70 blur-3xl"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e5e9] px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <motion.span
                animate={reduceMotion ? undefined : { rotate: [0, -4, 4, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#182033] text-white shadow-[0_12px_26px_rgba(24,32,51,.18)]"
              >
                <MessageSquareText size={19} />
                <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-[#287a71]" />
              </motion.span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="chat-title" className="truncate text-sm font-semibold tracking-[-0.025em] text-[#182033] sm:text-base">
                    KrimeAI intelligence assistant
                  </h2>
                  <span className="rounded-full bg-[#e5f1ef] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#287a71]">
                    Ready
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[9px] text-[#858d97] sm:text-[10px]">
                  <Clock3 size={11} /> Session opened at 10:00 · local simulation
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={downloadTranscript}
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              className={`flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-[10px] font-semibold transition-colors ${
                downloaded
                  ? "border-[#bcd8d3] bg-[#e5f1ef] text-[#287a71]"
                  : "border-[#d8dee3] bg-white text-[#56616d] hover:border-[#c5cdd4] hover:text-[#182033]"
              }`}
              aria-label="Download current conversation transcript"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={downloaded ? "done" : "download"}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  {downloaded ? <Check size={14} /> : <Download size={14} />}
                  {downloaded ? "Downloaded" : "Dump log"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          <div
            ref={threadRef}
            className="thin-scrollbar relative flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6 sm:py-7"
            aria-live="polite"
            aria-label="KrimeAI conversation"
          >
            <AnimatePresence initial>
              {messages.map((message, index) => {
                const isUser = message.sender === "user";

                return (
                  <motion.article
                    layout="position"
                    key={message.id}
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: isUser ? 24 : -24, y: 15, scale: 0.975 }
                    }
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                    transition={
                      reduceMotion
                        ? { duration: 0.12 }
                        : {
                            delay: Math.min(index * 0.065, 0.32),
                            type: "spring",
                            stiffness: 300,
                            damping: 27,
                            mass: 0.72,
                          }
                    }
                    className={`flex items-start gap-3 ${isUser ? "ml-auto max-w-[88%] flex-row-reverse sm:max-w-[75%]" : "max-w-[94%] sm:max-w-[82%]"}`}
                  >
                    <motion.span
                      whileHover={reduceMotion ? undefined : { rotate: isUser ? 6 : -6, scale: 1.07 }}
                      className={`flex size-9 shrink-0 items-center justify-center rounded-2xl border sm:size-10 ${
                        isUser
                          ? "border-[#f0c2b7] bg-[#fbeae5] text-[#d9482b]"
                          : "border-[#d6e0e7] bg-[#e9f0f5] text-[#4f7899]"
                      }`}
                    >
                      {isUser ? <User size={16} /> : <Bot size={17} />}
                    </motion.span>

                    <div className={`min-w-0 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                      <div
                        className={`rounded-[22px] px-4 py-3.5 text-[12px] leading-relaxed shadow-sm sm:px-5 sm:py-4 sm:text-[13px] ${
                          isUser
                            ? "rounded-tr-md bg-[#182033] text-white shadow-[0_12px_28px_rgba(24,32,51,.14)]"
                            : "rounded-tl-md border border-[#dfe5e9] bg-white text-[#344052]"
                        }`}
                      >
                        {message.text}
                      </div>
                      <span className={`mt-1.5 px-1 font-mono text-[8px] tracking-wide text-[#929aa3] ${isUser ? "text-right" : "text-left"}`}>
                        {isUser ? "Officer" : "KrimeAI"} · {message.timestamp}
                      </span>

                      {message.hasCard && message.intelligence && (
                        <motion.div
                          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96, rotateX: 5 }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0.12 }
                              : { delay: 0.42, type: "spring", stiffness: 250, damping: 24 }
                          }
                          whileHover={reduceMotion ? undefined : { y: -3, rotateX: 0.5, rotateY: -0.5 }}
                          className="relative mt-3 w-full max-w-[510px] overflow-hidden rounded-[26px] border border-[#cdd9e2] bg-[#edf3f7] p-4 shadow-[0_18px_38px_rgba(67,88,105,.11)] sm:p-5"
                        >
                          <motion.div
                            aria-hidden
                            animate={reduceMotion ? undefined : { x: ["-120%", "250%"] }}
                            transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
                            className="absolute inset-y-0 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                          />
                          <div className="relative flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#d9482b] shadow-sm">
                                <FileText size={16} />
                              </span>
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#72808d]">Grounded intelligence</p>
                                <h3 className="mt-0.5 text-sm font-semibold tracking-[-0.025em] capitalize text-[#182033]">{message.intelligence.intent.replace("-", " ")}</h3>
                              </div>
                            </div>
                            <span className="rounded-full bg-white/75 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-[#287a71]">{message.intelligence.confidence} confidence</span>
                          </div>

                          <div className="relative mt-4 grid overflow-hidden rounded-2xl border border-white/80 bg-white/55 sm:grid-cols-3">
                            {message.intelligence.metrics.slice(0, 3).map((metric, metricIndex) => (
                            <div key={metric.label} className={`${metricIndex > 0 ? "border-t border-[#d5e0e7] sm:border-l sm:border-t-0" : ""} p-3.5 sm:p-4`}>
                              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#7b8792]">{metric.label}</p>
                              <motion.p
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: reduceMotion ? 0 : 0.68 + metricIndex * 0.08 }}
                                className="mt-1 text-2xl font-semibold tracking-[-0.055em] text-[#182033]"
                              >
                                {metric.value}
                              </motion.p>
                            </div>
                            ))}
                            {false && (
                            <div className="border-l border-[#d5e0e7] p-3.5 sm:p-4">
                              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#7b8792]">Confidence</p>
                              <motion.p
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: reduceMotion ? 0 : 0.78 }}
                                className="mt-1 text-2xl font-semibold tracking-[-0.055em] text-[#d9482b]"
                              >
                                {data ? "Live" : "—"}
                              </motion.p>
                            </div>
                            )}
                          </div>

                          {message.intelligence.references.length > 0 && (
                            <div className="relative mt-4 space-y-2">
                              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#72808d]">Evidence trail</p>
                              {message.intelligence.references.slice(0, 4).map((reference) => (
                                <div key={`${reference.type}-${reference.id}`} className="rounded-2xl border border-white/85 bg-white/60 p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-[11px] font-semibold text-[#182033]">{reference.title}</p>
                                      <p className="mt-1 text-[9px] leading-relaxed text-[#69747f]">{reference.detail}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[#eef2f5] px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-[#5f6b76]">
                                      {reference.type} {reference.id}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="relative mt-4 rounded-2xl border border-white/85 bg-white/45 p-3.5">
                            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#72808d]">Reasoning path</p>
                            <ol className="mt-2 space-y-1.5">
                              {message.intelligence.reasoning.slice(0, 3).map((step) => (
                                <li key={step} className="flex gap-2 text-[9px] leading-relaxed text-[#64727e]">
                                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#d9482b]" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {message.intelligence.followUps.length > 0 && (
                            <div className="relative mt-4 flex flex-wrap gap-2">
                              {message.intelligence.followUps.slice(0, 3).map((followUp) => (
                                <button
                                  key={followUp}
                                  type="button"
                                  onClick={() => applySuggestion(followUp)}
                                  className="rounded-full border border-[#dce2e6] bg-white/65 px-3 py-2 text-[9px] font-semibold text-[#56616d] transition-colors hover:border-[#e3aa9d] hover:bg-[#fbeae5] hover:text-[#b93d25]"
                                >
                                  {followUp}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[9px] leading-relaxed text-[#6c7884]">{data?.hotspots.length ?? 0} station clusters · {data?.network.edges.length ?? 0} entity links</p>
                            <Link
                              href="/map"
                              className="group flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#182033] px-3.5 text-[9px] font-semibold text-white shadow-sm transition-colors hover:bg-[#d9482b]"
                            >
                              <MapPinned size={12} /> Visualize map
                              <ArrowUpRight size={11} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.article>
                );
              })}

              {isResponding && (
                <motion.div
                  key="typing"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16, y: 8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5, scale: 0.96 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex size-9 items-center justify-center rounded-2xl border border-[#d6e0e7] bg-[#e9f0f5] text-[#4f7899]">
                    <Bot size={16} />
                  </span>
                  <div className="flex items-center gap-1 rounded-[18px] rounded-tl-md border border-[#dfe5e9] bg-white px-4 py-3.5 shadow-sm" aria-label="KrimeAI is responding">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={reduceMotion ? undefined : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
                        transition={{ duration: 0.75, repeat: Infinity, delay: dot * 0.12, ease: "easeInOut" }}
                        className="size-1.5 rounded-full bg-[#75a7d3]"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-[#e0e5e9] bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 thin-scrollbar" aria-label="Suggested questions">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.62 + index * 0.07 }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className="shrink-0 rounded-full border border-[#dce2e6] bg-[#f5f7f8] px-3 py-2 text-[9px] font-medium text-[#68727d] transition-colors hover:border-[#e3aa9d] hover:bg-[#fbeae5] hover:text-[#b93d25]"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>

            <form onSubmit={submitMessage} className="relative">
              <label htmlFor="krimeai-query" className="sr-only">Ask KrimeAI a question</label>
              <Sparkles size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#75a7d3]" />
              <input
                ref={inputRef}
                id="krimeai-query"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={isResponding ? "KrimeAI is acknowledging your request…" : "Ask about a case, pattern, person, or location…"}
                autoComplete="off"
                maxLength={320}
                className="h-14 w-full rounded-full border border-[#d5dce1] bg-[#f7f8f9] pl-11 pr-16 text-[12px] text-[#182033] shadow-inner outline-none transition-all placeholder:text-[#929aa3] focus:border-[#d9482b]/45 focus:bg-white focus:shadow-[0_0_0_4px_rgba(217,72,43,.08)] sm:text-[13px]"
              />
              <motion.button
                type="submit"
                disabled={!draft.trim() || isResponding}
                whileHover={!reduceMotion && draft.trim() && !isResponding ? { scale: 1.06, rotate: -4 } : undefined}
                whileTap={!reduceMotion && draft.trim() && !isResponding ? { scale: 0.9 } : undefined}
                className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#d9482b] text-white shadow-[0_9px_22px_rgba(217,72,43,.24)] transition-colors hover:bg-[#c63f26] disabled:cursor-not-allowed disabled:bg-[#c9cfd4] disabled:shadow-none"
                aria-label="Send intelligence query"
              >
                <Send size={16} />
              </motion.button>
            </form>
            <div className="mt-2 flex items-center justify-between px-2 text-[8px] text-[#929aa3]">
              <span>Local demo · no external service connected</span>
              <span className="font-mono">{draft.length}/320</span>
            </div>
          </div>
        </motion.section>

        <motion.aside
          variants={{
            hidden: reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, x: 26, filter: "blur(6px)" },
            visible: { opacity: 1, x: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: reduceMotion ? 0.12 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-5 md:grid-cols-2 xl:sticky xl:top-[98px] xl:grid-cols-1"
          aria-label="Intelligence session context"
        >
          <motion.section
            whileHover={reduceMotion ? undefined : { y: -4, rotateX: 0.5, rotateY: -0.5 }}
            transition={{ type: "spring", stiffness: 250, damping: 24 }}
            className="dashboard-surface rounded-[28px] p-5 sm:p-6"
            aria-labelledby="working-set-title"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#fbeae5] text-[#d9482b]">
                <FileSearch size={16} />
              </span>
              <span className="rounded-full bg-[#eef1f3] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#69747f]">Session 04</span>
            </div>
            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9199a2]">Working set</p>
            <h2 id="working-set-title" className="mt-1 text-lg font-semibold tracking-[-0.035em] text-[#182033]">Catalyst FIR register</h2>
            <p className="mt-2 text-[10px] leading-relaxed text-[#77818c]">Queries run against the current records in your Development Data Store.</p>

            <dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e0e5e9] bg-[#f5f7f8]">
              <div className="p-3.5">
                <dt className="text-[8px] uppercase tracking-wider text-[#87909a]">Period</dt>
                <dd className="mt-1 text-xs font-semibold text-[#283245]">All indexed</dd>
              </div>
              <div className="border-l border-[#dde3e7] p-3.5">
                <dt className="text-[8px] uppercase tracking-wider text-[#87909a]">Records</dt>
                <dd className="mt-1 text-xs font-semibold text-[#d9482b]">{data?.summary.totalCases ?? "—"} found</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {[data?.source || "Catalyst", `${data?.summary.highPriority ?? 0} high priority`, `${data?.summary.arrests ?? 0} arrests`].map((tag) => (
                <span key={tag} className="rounded-full bg-[#e9eff3] px-2.5 py-1.5 text-[8px] font-semibold text-[#607587]">{tag}</span>
              ))}
            </div>
          </motion.section>

          <motion.section
            whileHover={reduceMotion ? undefined : { y: -4 }}
            transition={{ type: "spring", stiffness: 250, damping: 24 }}
            className="soft-grid relative overflow-hidden rounded-[28px] bg-[#cfd9e1] p-5 shadow-[0_18px_45px_rgba(62,78,94,.12)] sm:p-6"
            aria-labelledby="next-actions-title"
          >
            <div aria-hidden className="dot-field absolute -right-12 -top-12 size-44 rotate-12 opacity-40" />
            <div className="scan-line" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#596773]">
                <Sparkles size={13} /> Connected views
              </div>
              <h2 id="next-actions-title" className="mt-4 text-lg font-semibold tracking-[-0.035em] text-[#182033]">Take the finding further.</h2>
              <p className="mt-2 text-[10px] leading-relaxed text-[#64727e]">Move from conversation to the map or relationship graph with the current case context.</p>

              <div className="mt-5 space-y-2">
                <Link href="/map" className="group flex min-h-11 items-center justify-between rounded-full bg-white px-4 text-[10px] font-semibold text-[#182033] shadow-sm transition-shadow hover:shadow-lg">
                  <span className="flex items-center gap-2"><MapPinned size={13} className="text-[#d9482b]" /> Open hotspot map</span>
                  <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link href="/network" className="group flex min-h-11 items-center justify-between rounded-full border border-white/60 bg-white/35 px-4 text-[10px] font-semibold text-[#344252] transition-colors hover:bg-white/65">
                  <span className="flex items-center gap-2"><FileSearch size={13} className="text-[#547b9a]" /> Inspect linked entities</span>
                  <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </motion.section>
        </motion.aside>
      </div>
    </motion.div>
  );
}
