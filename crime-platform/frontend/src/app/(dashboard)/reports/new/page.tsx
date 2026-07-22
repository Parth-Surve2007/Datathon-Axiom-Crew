"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FilePenLine,
  FileText,
  Fingerprint,
  Link2,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import { createReportId, saveReport, type ReportPriority, type ReportRecord, type ReportType } from "@/lib/reports";

const reportTypes: Array<{ type: ReportType; description: string; icon: typeof Fingerprint; color: string; soft: string }> = [
  { type: "Investigation", description: "Open and manage a structured investigative file", icon: Fingerprint, color: "#d9482b", soft: "#fbeae5" },
  { type: "Incident Report", description: "Document a specific event, response, and outcome", icon: ClipboardList, color: "#54779b", soft: "#e8f0f7" },
  { type: "Intelligence Brief", description: "Present analytical findings and emerging risks", icon: Sparkles, color: "#287a71", soft: "#e5f1ef" },
  { type: "Case Summary", description: "Consolidate facts, evidence, and case progress", icon: FileText, color: "#a36200", soft: "#fff0d8" },
];

const steps = ["Foundation", "Link records", "Analysis", "Review"];
const fieldClass = "mt-2 h-12 w-full rounded-2xl border border-[#d9dfe3] bg-white px-4 text-[11px] text-[#263044] outline-none transition placeholder:text-[#a0a7af] focus:border-[#d9482b]/50 focus:ring-4 focus:ring-[#d9482b]/5";
const textareaClass = "mt-2 min-h-36 w-full resize-y rounded-[20px] border border-[#d9dfe3] bg-white p-4 text-[11px] leading-6 text-[#263044] outline-none transition placeholder:text-[#a0a7af] focus:border-[#d9482b]/50 focus:ring-4 focus:ring-[#d9482b]/5";

type Draft = {
  type: ReportType;
  title: string;
  priority: ReportPriority;
  district: string;
  station: string;
  leadOfficer: string;
  classification: ReportRecord["classification"];
  linkedFirs: string[];
  summary: string;
  findings: string;
  recommendations: string;
};

export default function CreateReportPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { data } = useLiveIntelligence();
  const [step, setStep] = useState(0);
  const [firInput, setFirInput] = useState("");
  const [savedState, setSavedState] = useState<"idle" | "draft" | "submitted">("idle");
  const [draft, setDraft] = useState<Draft>({ type: "Investigation", title: "", priority: "High", district: "Bengaluru East", station: "Indiranagar PS", leadOfficer: "Ananya Rao", classification: "Restricted", linkedFirs: [], summary: "", findings: "", recommendations: "" });

  const suggestions = useMemo(() => (data?.investigations ?? []).slice(0, 4).map((item) => ({ id: item.id, title: item.title, district: item.district })), [data]);
  const completed = [Boolean(draft.title && draft.district && draft.station), draft.linkedFirs.length > 0, Boolean(draft.summary && draft.findings), Boolean(draft.recommendations)];
  const completeness = Math.round((completed.filter(Boolean).length / completed.length) * 100);

  const addFir = (value = firInput) => {
    const normalized = value.trim().toUpperCase();
    if (!normalized || draft.linkedFirs.includes(normalized)) return;
    setDraft((current) => ({ ...current, linkedFirs: [...current.linkedFirs, normalized] }));
    setFirInput("");
  };

  const persist = (status: ReportRecord["status"]) => {
    const now = new Date().toISOString();
    saveReport({
      ...draft,
      id: createReportId(draft.type),
      title: draft.title.trim() || `Untitled ${draft.type}`,
      status,
      createdAt: now,
      updatedAt: now,
    });
    setSavedState(status === "Draft" ? "draft" : "submitted");
    window.setTimeout(() => router.push("/reports"), 650);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    persist("Under Review");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/reports" className="mb-3 flex w-fit items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#7d8691] hover:text-[#d9482b]"><ArrowLeft size={12} /> Reports registry</Link>
          <h1 className="text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-none tracking-[-0.055em] text-[#182033]">Create operational record</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#737b86] sm:text-sm">Build an investigation or report with linked evidence, analytical findings, and a clear supervisory trail.</p>
        </div>
        <button type="button" onClick={() => persist("Draft")} className="flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-[#d4dbe0] bg-white px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#56616d] shadow-sm transition hover:-translate-y-0.5 sm:self-auto"><Save size={14} /> Save draft</button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1fr_310px] xl:gap-6">
        <form onSubmit={submit} className="dashboard-surface min-w-0 rounded-[28px] p-4 sm:rounded-[32px] sm:p-6">
          <nav aria-label="Creation progress" className="grid grid-cols-4 gap-1 rounded-[20px] bg-[#eef1f3] p-1.5">
            {steps.map((label, index) => (
              <button type="button" key={label} onClick={() => setStep(index)} className={`relative min-h-12 rounded-2xl px-2 text-[8px] font-bold uppercase tracking-[0.1em] transition sm:text-[9px] ${step === index ? "text-[#182033]" : completed[index] ? "text-[#287a71]" : "text-[#8a929c]"}`}>
                {step === index && <motion.span layoutId="report-step" className="absolute inset-0 rounded-2xl bg-white shadow-sm" transition={{ type: "spring", stiffness: 330, damping: 30 }} />}
                <span className="relative flex items-center justify-center gap-1.5">{completed[index] ? <CheckCircle2 size={12} /> : <span className="flex size-4 items-center justify-center rounded-full border border-current text-[7px]">{index + 1}</span>}<span className="hidden sm:inline">{label}</span></span>
              </button>
            ))}
          </nav>

          <div className="mt-6 min-h-[520px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }} transition={{ duration: 0.28 }}>
                {step === 0 && (
                  <section aria-labelledby="foundation-title">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Step 1 of 4</p><h2 id="foundation-title" className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#182033]">Choose the record you are building</h2><p className="mt-1 text-[10px] text-[#7b848e]">This sets the record identifier and review workflow.</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {reportTypes.map((item) => { const Icon = item.icon; const selected = draft.type === item.type; return <button type="button" key={item.type} onClick={() => setDraft((current) => ({ ...current, type: item.type }))} className={`relative flex min-h-24 items-start gap-3 rounded-[22px] border p-4 text-left transition ${selected ? "border-[#d9482b]/35 bg-white shadow-[0_12px_35px_rgba(24,32,51,.07)]" : "border-[#dde2e6] bg-white/45 hover:bg-white"}`}><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl" style={{ color: item.color, backgroundColor: item.soft }}><Icon size={17} /></span><span><span className="block text-[11px] font-semibold text-[#283144]">{item.type}</span><span className="mt-1 block text-[9px] leading-relaxed text-[#858e98]">{item.description}</span></span>{selected && <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[#d9482b] text-white"><Check size={11} /></span>}</button>; })}
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2"><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]">Record title</span><input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. East corridor relay-theft investigation" className={fieldClass} /></label>
                      <label><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]">Priority</span><span className="relative block"><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as ReportPriority })} className={`${fieldClass} appearance-none pr-10`}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><ChevronDown size={12} className="pointer-events-none absolute right-4 top-[27px] text-[#7b848e]" /></span></label>
                      <label><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]">Classification</span><span className="relative block"><select value={draft.classification} onChange={(event) => setDraft({ ...draft, classification: event.target.value as Draft["classification"] })} className={`${fieldClass} appearance-none pr-10`}><option>Restricted</option><option>Confidential</option><option>Internal</option></select><ChevronDown size={12} className="pointer-events-none absolute right-4 top-[27px] text-[#7b848e]" /></span></label>
                      <label><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]">District</span><input required value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} className={fieldClass} /></label>
                      <label><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]">Police station / unit</span><input required value={draft.station} onChange={(event) => setDraft({ ...draft, station: event.target.value })} className={fieldClass} /></label>
                      <label className="sm:col-span-2"><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]">Lead officer</span><input required value={draft.leadOfficer} onChange={(event) => setDraft({ ...draft, leadOfficer: event.target.value })} className={fieldClass} /></label>
                    </div>
                  </section>
                )}

                {step === 1 && (
                  <section aria-labelledby="records-title">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Step 2 of 4</p><h2 id="records-title" className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#182033]">Link evidence and case records</h2><p className="mt-1 text-[10px] text-[#7b848e]">Attach FIRs so every conclusion has a visible evidence trail.</p>
                    <div className="mt-6 rounded-[24px] border border-[#dbe1e5] bg-white/55 p-4 sm:p-5"><label><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]">FIR or case identifier</span><span className="mt-2 flex gap-2"><span className="relative flex-1"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#87909a]" /><input value={firInput} onChange={(event) => setFirInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addFir(); } }} placeholder="KA-2026-0482" className="h-12 w-full rounded-2xl border border-[#d9dfe3] bg-white pl-10 pr-4 text-[11px] uppercase text-[#263044] outline-none focus:border-[#d9482b]/50" /></span><button type="button" onClick={() => addFir()} className="flex size-12 items-center justify-center rounded-2xl bg-[#182033] text-white"><Plus size={16} /></button></span></label>
                      <div className="mt-4 flex min-h-14 flex-wrap content-start gap-2">{draft.linkedFirs.length ? draft.linkedFirs.map((fir) => <span key={fir} className="flex items-center gap-2 rounded-full bg-[#e8f0f7] py-1.5 pl-3 pr-1.5 font-mono text-[9px] font-semibold text-[#54779b]"><Link2 size={10} /> {fir}<button type="button" onClick={() => setDraft((current) => ({ ...current, linkedFirs: current.linkedFirs.filter((item) => item !== fir) }))} className="flex size-5 items-center justify-center rounded-full bg-white/70"><X size={10} /></button></span>) : <p className="self-center text-[10px] text-[#979ea6]">No linked records yet.</p>}</div>
                    </div>
                    {suggestions.length > 0 && <div className="mt-5"><h3 className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7d8691]">Suggested from active investigations</h3><div className="mt-2 grid gap-2">{suggestions.map((item) => <button type="button" key={item.id} onClick={() => addFir(item.id)} disabled={draft.linkedFirs.includes(item.id)} className="flex items-center gap-3 rounded-[20px] border border-[#dde2e6] bg-white/50 p-3 text-left transition hover:bg-white disabled:opacity-45"><span className="flex size-9 items-center justify-center rounded-xl bg-[#fbeae5] text-[#d9482b]"><FileText size={14} /></span><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-[#303a4d]">{item.title}</span><span className="mt-0.5 block text-[8px] text-[#89919b]">{item.id} · {item.district}</span></span><Plus size={13} className="text-[#7b848e]" /></button>)}</div></div>}
                  </section>
                )}

                {step === 2 && (
                  <section aria-labelledby="analysis-title">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Step 3 of 4</p><h2 id="analysis-title" className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#182033]">Record the analytical assessment</h2><p className="mt-1 text-[10px] text-[#7b848e]">Separate verified facts from interpretation and proposed action.</p>
                    <div className="mt-6 space-y-5"><label className="block"><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]"><BookOpenCheck size={13} className="text-[#54779b]" /> Executive summary</span><textarea required value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} placeholder="Summarise the situation, scope, and operational significance…" className={textareaClass} /></label><label className="block"><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]"><Fingerprint size={13} className="text-[#d9482b]" /> Key findings</span><textarea required value={draft.findings} onChange={(event) => setDraft({ ...draft, findings: event.target.value })} placeholder="Document confirmed links, patterns, evidence, and confidence limitations…" className={textareaClass} /></label><label className="block"><span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#727c87]"><ShieldCheck size={13} className="text-[#287a71]" /> Recommended actions</span><textarea value={draft.recommendations} onChange={(event) => setDraft({ ...draft, recommendations: event.target.value })} placeholder="List the next investigative, preventive, or supervisory actions…" className={textareaClass} /></label></div>
                  </section>
                )}

                {step === 3 && (
                  <section aria-labelledby="review-title">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Step 4 of 4</p><h2 id="review-title" className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#182033]">Review before submission</h2><p className="mt-1 text-[10px] text-[#7b848e]">The record will enter the supervisory review queue.</p>
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-[#dce2e6] bg-white/65"><div className="flex items-start gap-4 border-b border-[#e1e5e8] p-5"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbeae5] text-[#d9482b]"><FilePenLine size={18} /></span><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#182033] px-2.5 py-1 text-[7px] font-bold uppercase text-white">{draft.type}</span><span className="rounded-full bg-[#fff0d8] px-2.5 py-1 text-[7px] font-bold uppercase text-[#a36200]">{draft.priority}</span><span className="rounded-full bg-[#eef1f3] px-2.5 py-1 text-[7px] font-bold uppercase text-[#65707a]">{draft.classification}</span></div><h3 className="mt-3 text-lg font-semibold tracking-[-0.035em] text-[#253044]">{draft.title || `Untitled ${draft.type}`}</h3><p className="mt-1 text-[9px] text-[#7e8791]">{draft.district} · {draft.station} · {draft.leadOfficer}</p></div></div><div className="grid gap-5 p-5 sm:grid-cols-2"><div className="sm:col-span-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#8a939d]">Executive summary</p><p className="mt-2 text-[10px] leading-5 text-[#56616d]">{draft.summary || "No summary added."}</p></div><div><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#8a939d]">Key findings</p><p className="mt-2 text-[10px] leading-5 text-[#56616d]">{draft.findings || "No findings added."}</p></div><div><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#8a939d]">Recommended actions</p><p className="mt-2 text-[10px] leading-5 text-[#56616d]">{draft.recommendations || "No recommendations added."}</p></div><div className="sm:col-span-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#8a939d]">Linked records</p><div className="mt-2 flex flex-wrap gap-2">{draft.linkedFirs.length ? draft.linkedFirs.map((fir) => <span key={fir} className="rounded-full bg-[#e8f0f7] px-3 py-1.5 font-mono text-[8px] font-semibold text-[#54779b]">{fir}</span>) : <span className="text-[10px] text-[#969da5]">No linked FIRs</span>}</div></div></div></div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#e1e5e8] pt-5"><button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="flex min-h-11 items-center gap-2 rounded-full px-4 text-[9px] font-bold uppercase tracking-wider text-[#65707a] disabled:opacity-30"><ArrowLeft size={13} /> Back</button><button type="submit" className="flex min-h-11 items-center gap-2 rounded-full bg-[#182033] px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-white shadow-lg transition hover:bg-[#d9482b]">{step === 3 ? "Submit for review" : "Continue"}{step === 3 ? <ShieldCheck size={14} /> : <ArrowRight size={14} />}</button></div>
        </form>

        <aside className="space-y-4">
          <section className="soft-grid sticky top-28 overflow-hidden rounded-[28px] bg-[#cfd9e1] p-5 shadow-[0_18px_45px_rgba(62,78,94,.12)] sm:p-6"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#596773]">Record quality</span><span className="text-xl font-semibold tracking-[-0.05em] text-[#182033]">{completeness}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/55"><motion.div animate={{ width: `${completeness}%` }} className="h-full rounded-full bg-[#287a71]" /></div><div className="mt-5 space-y-2.5">{steps.map((label, index) => <button type="button" key={label} onClick={() => setStep(index)} className="flex w-full items-center gap-3 rounded-2xl bg-white/45 p-3 text-left"><span className={`flex size-7 items-center justify-center rounded-full ${completed[index] ? "bg-[#287a71] text-white" : "bg-white/80 text-[#7d8791]"}`}>{completed[index] ? <Check size={12} /> : <span className="text-[8px] font-bold">{index + 1}</span>}</span><span className="text-[10px] font-semibold text-[#43505c]">{label}</span>{step === index && <span className="ml-auto size-1.5 rounded-full bg-[#d9482b]" />}</button>)}</div><div className="mt-5 rounded-[20px] bg-white/55 p-4"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#56636f]"><Sparkles size={12} /> Intelligence tip</p><p className="mt-2 text-[9px] leading-5 text-[#677580]">Link every conclusion to an FIR or evidence record. Clearly distinguish verified facts from analytical inference.</p></div></section>
        </aside>
      </div>

      <AnimatePresence>{savedState !== "idle" && <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#182033] px-5 py-3 text-white shadow-[0_20px_60px_rgba(24,32,51,.3)]"><span className="flex size-7 items-center justify-center rounded-full bg-[#287a71]"><Check size={13} /></span><span className="text-[10px] font-semibold">{savedState === "draft" ? "Draft saved locally" : "Submitted for supervisory review"}</span></motion.div>}</AnimatePresence>
    </motion.div>
  );
}
