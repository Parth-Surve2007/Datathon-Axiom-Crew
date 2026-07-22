"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Download,
  FileSearch,
  FileStack,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { type ReportRecord, type ReportStatus, useReports, updateReportStatus } from "@/lib/reports";

const statusStyle: Record<ReportStatus, string> = {
  Draft: "bg-[#eef1f3] text-[#65707a]",
  "Under Review": "bg-[#e8f0f7] text-[#54779b]",
  Approved: "bg-[#e5f1ef] text-[#287a71]",
  "Action Required": "bg-[#fbeae5] text-[#d9482b]",
};

const priorityStyle = {
  Critical: "bg-[#d9482b] text-white",
  High: "bg-[#fff0d8] text-[#a36200]",
  Medium: "bg-[#e8f0f7] text-[#54779b]",
  Low: "bg-[#eef1f3] text-[#68727d]",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(date));
}

export default function ReportsPage() {
  const reports = useReports();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | ReportStatus>("All");
  const [type, setType] = useState("All types");
  const [selected, setSelected] = useState<ReportRecord | null>(null);
  const [page, setPage] = useState(0);
  const portalTarget = typeof document === "undefined" ? null : document.body;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesQuery = !normalized || `${report.id} ${report.title} ${report.district} ${report.leadOfficer} ${report.linkedFirs.join(" ")}`.toLowerCase().includes(normalized);
      return matchesQuery && (status === "All" || report.status === status) && (type === "All types" || report.type === type);
    });
  }, [query, reports, status, type]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleReports = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const rangeStart = filtered.length ? safePage * pageSize + 1 : 0;
  const rangeEnd = Math.min((safePage + 1) * pageSize, filtered.length);

  const stats = [
    { label: "All reports", value: reports.length, icon: FileStack, color: "#182033" },
    { label: "Under review", value: reports.filter((item) => item.status === "Under Review").length, icon: FileSearch, color: "#54779b" },
    { label: "Action required", value: reports.filter((item) => item.status === "Action Required").length, icon: ShieldAlert, color: "#d9482b" },
    { label: "Approved", value: reports.filter((item) => item.status === "Approved").length, icon: CheckCircle2, color: "#287a71" },
  ];

  const exportReport = (report: ReportRecord) => {
    const lines = [report.title, report.id, "", `Type: ${report.type}`, `Status: ${report.status}`, `Priority: ${report.priority}`, `District: ${report.district}`, `Station: ${report.station}`, `Lead officer: ${report.leadOfficer}`, `Classification: ${report.classification}`, `Linked FIRs: ${report.linkedFirs.join(", ")}`, "", "SUMMARY", report.summary, "", "KEY FINDINGS", report.findings, "", "RECOMMENDED ACTIONS", report.recommendations];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#858e98]"><span className="live-dot size-2 rounded-full bg-[#287a71]" /> Investigation registry</div>
          <h1 className="text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-none tracking-[-0.055em] text-[#182033]">Reports & investigations</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#737b86] sm:text-sm">Review, search, and manage every operational report from first draft through supervisory approval.</p>
        </div>
        <Link href="/reports/new" className="flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-[#182033] px-5 text-[10px] font-bold uppercase tracking-[0.13em] text-white shadow-[0_12px_30px_rgba(24,32,51,.18)] transition hover:-translate-y-0.5 hover:bg-[#d9482b] sm:self-auto"><Plus size={15} /> Create new</Link>
      </header>

      <section aria-label="Report summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return <motion.article key={item.label} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.055 }} className="dashboard-surface lift-card rounded-[24px] p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#89929c] sm:text-[9px]">{item.label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-[#182033]">{item.value}</p></div><span className="flex size-9 items-center justify-center rounded-xl" style={{ color: item.color, backgroundColor: `${item.color}12` }}><Icon size={16} /></span></div></motion.article>;
        })}
      </section>

      <section className="dashboard-surface rounded-[28px] p-4 sm:rounded-[32px] sm:p-6" aria-labelledby="registry-title">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Case records</p><h2 id="registry-title" className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#182033]">Operational registry</h2></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:w-72"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#828b95]" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Search report, FIR, officer…" className="h-11 w-full rounded-full border border-[#d9dfe3] bg-white pl-10 pr-4 text-[11px] text-[#182033] outline-none transition focus:border-[#d9482b]/50" /></label>
            <label className="relative"><Filter size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a838d]" /><select value={status} onChange={(event) => { setStatus(event.target.value as "All" | ReportStatus); setPage(0); }} className="h-11 appearance-none rounded-full border border-[#d9dfe3] bg-white pl-9 pr-8 text-[10px] font-medium text-[#4e5966] outline-none"><option>All</option><option>Draft</option><option>Under Review</option><option>Approved</option><option>Action Required</option></select><ChevronDown size={11} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808892]" /></label>
            <label className="relative"><select value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} className="h-11 appearance-none rounded-full border border-[#d9dfe3] bg-white pl-4 pr-8 text-[10px] font-medium text-[#4e5966] outline-none"><option>All types</option><option>Investigation</option><option>Incident Report</option><option>Intelligence Brief</option><option>Case Summary</option></select><ChevronDown size={11} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#808892]" /></label>
          </div>
        </div>

        <div className="thin-scrollbar mt-5 max-h-[620px] overflow-y-auto rounded-[22px] border border-[#dde2e6] bg-white/40">
          <div className="sticky top-0 z-10 hidden grid-cols-[1.5fr_.7fr_.65fr_.7fr_80px] gap-4 border-b border-[#dde2e6] bg-[#f0f3f5]/95 px-5 py-3 text-[8px] font-bold uppercase tracking-[0.15em] text-[#818a95] backdrop-blur-xl lg:grid"><span>Report</span><span>Location</span><span>Owner</span><span>Status</span><span /> </div>
          {visibleReports.length ? visibleReports.map((report, index) => (
            <motion.article key={report.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.035, 0.25) }} className={`grid gap-3 bg-white/70 p-4 transition hover:bg-white lg:grid-cols-[1.5fr_.7fr_.65fr_.7fr_80px] lg:items-center lg:gap-4 lg:px-5 ${index ? "border-t border-[#e1e5e8]" : ""}`}>
              <button type="button" onClick={() => setSelected(report)} className="min-w-0 text-left"><span className="flex flex-wrap items-center gap-2"><span className="text-[12px] font-semibold text-[#253044]">{report.title}</span><span className={`rounded-full px-2 py-1 text-[7px] font-bold uppercase tracking-wider ${priorityStyle[report.priority]}`}>{report.priority}</span></span><span className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-[#828b95]"><span className="font-mono font-semibold text-[#596471]">{report.id}</span><span>·</span><span>{report.type}</span><span>·</span><span>{report.linkedFirs.length} linked FIR{report.linkedFirs.length === 1 ? "" : "s"}</span></span></button>
              <div className="text-[9px] text-[#6f7984]"><span className="flex items-center gap-1.5"><MapPin size={10} /> {report.district}</span><span className="mt-1 block pl-4 text-[#959ca5]">{report.station}</span></div>
              <div className="text-[9px] text-[#6f7984]"><span className="flex items-center gap-1.5"><UserRound size={10} /> {report.leadOfficer}</span><span className="mt-1 flex items-center gap-1.5 text-[#959ca5]"><CalendarDays size={10} /> {formatDate(report.updatedAt)}</span></div>
              <span className={`w-fit rounded-full px-2.5 py-1.5 text-[8px] font-bold ${statusStyle[report.status]}`}>{report.status}</span>
              <button type="button" onClick={() => setSelected(report)} className="flex h-9 items-center justify-center gap-1 rounded-full bg-[#eef1f3] px-3 text-[8px] font-bold uppercase tracking-wider text-[#58636e] hover:bg-[#182033] hover:text-white">Open <ArrowUpRight size={10} /></button>
            </motion.article>
          )) : <div className="flex min-h-52 flex-col items-center justify-center bg-white/60 p-8 text-center"><FileSearch size={25} className="text-[#9aa2aa]" /><p className="mt-3 text-sm font-semibold text-[#303a4c]">No matching reports</p><p className="mt-1 text-[10px] text-[#858e98]">Try clearing a filter or searching another FIR.</p></div>}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] font-medium text-[#7d8691]">Showing <span className="font-bold text-[#303a4c]">{rangeStart}–{rangeEnd}</span> of <span className="font-bold text-[#303a4c]">{filtered.length}</span> matching reports · 10 per page</p>
          <div className="flex items-center justify-end gap-2">
            <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.15em] text-[#929aa3]">Page {safePage + 1} of {pageCount}</span>
            <button type="button" onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0} className="flex h-10 items-center gap-1.5 rounded-full border border-[#d8dee3] bg-white px-3.5 text-[8px] font-bold uppercase tracking-wider text-[#606a75] transition hover:border-[#bcc5cc] disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={12} /> Previous</button>
            <button type="button" onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))} disabled={safePage >= pageCount - 1} className="flex h-10 items-center gap-1.5 rounded-full bg-[#182033] px-4 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#d9482b] disabled:cursor-not-allowed disabled:bg-[#cbd1d6] disabled:shadow-none">Next <ChevronRight size={12} /></button>
          </div>
        </div>
      </section>

      {portalTarget && createPortal(
        <AnimatePresence>
        {selected && (
          <>
            <motion.button aria-label="Close report details" onClick={() => setSelected(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 bottom-0 top-[76px] z-[85] bg-[#182033]/20 backdrop-blur-[2px]" />
            <motion.aside initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 520 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 520 }} transition={{ type: "spring", stiffness: 290, damping: 31 }} className="fixed bottom-[5.75rem] right-3 top-[5.5rem] z-[90] flex w-[min(38rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[#f7f9fa]/97 shadow-[0_32px_100px_rgba(24,32,51,.3)] backdrop-blur-2xl md:bottom-3">
              <div className="border-b border-[#dce2e6] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[9px] font-bold text-[#6d7782]">{selected.id}</span><span className={`rounded-full px-2 py-1 text-[7px] font-bold uppercase ${priorityStyle[selected.priority]}`}>{selected.priority}</span><span className="rounded-full bg-[#182033] px-2 py-1 text-[7px] font-bold uppercase text-white">{selected.classification}</span></div><h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.045em] text-[#182033]">{selected.title}</h2><p className="mt-2 text-[10px] text-[#75808b]">{selected.type} · Updated {formatDate(selected.updatedAt)}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close details" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#68727d] shadow-sm"><X size={15} /></button></div></div>
              <div className="thin-scrollbar flex-1 overflow-y-auto p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-2"><div className="rounded-2xl bg-white p-3"><p className="text-[8px] font-bold uppercase tracking-wider text-[#929aa3]">Jurisdiction</p><p className="mt-1 text-[10px] font-semibold text-[#303a4c]">{selected.district}</p><p className="mt-0.5 text-[9px] text-[#808994]">{selected.station}</p></div><div className="rounded-2xl bg-white p-3"><p className="text-[8px] font-bold uppercase tracking-wider text-[#929aa3]">Lead officer</p><p className="mt-1 text-[10px] font-semibold text-[#303a4c]">{selected.leadOfficer}</p><p className="mt-0.5 text-[9px] text-[#808994]">Primary owner</p></div></div>
                {[{ label: "Executive summary", value: selected.summary }, { label: "Key findings", value: selected.findings }, { label: "Recommended actions", value: selected.recommendations }].map((section) => <section key={section.label} className="mt-5"><h3 className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7e8791]">{section.label}</h3><p className="mt-2 text-[11px] leading-6 text-[#4f5967]">{section.value}</p></section>)}
                <section className="mt-5"><h3 className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7e8791]">Linked records</h3><div className="mt-2 flex flex-wrap gap-2">{selected.linkedFirs.map((fir) => <span key={fir} className="rounded-full bg-[#e8f0f7] px-3 py-1.5 font-mono text-[9px] font-semibold text-[#54779b]">{fir}</span>)}</div></section>
              </div>
              <div className="grid gap-2 border-t border-[#dce2e6] p-4 sm:grid-cols-[1fr_auto] sm:p-5"><label className="relative"><span className="sr-only">Report status</span><select value={selected.status} onChange={(event) => { const next = event.target.value as ReportStatus; updateReportStatus(selected.id, next); setSelected({ ...selected, status: next, updatedAt: new Date().toISOString() }); }} className="h-11 w-full appearance-none rounded-full border border-[#d6dde2] bg-white pl-4 pr-9 text-[10px] font-semibold text-[#3f4a58] outline-none"><option>Draft</option><option>Under Review</option><option>Approved</option><option>Action Required</option></select><ChevronDown size={12} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7a838d]" /></label><button type="button" onClick={() => exportReport(selected)} className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#182033] px-5 text-[9px] font-bold uppercase tracking-wider text-white"><Download size={13} /> Export</button></div>
            </motion.aside>
          </>
        )}
        </AnimatePresence>,
        portalTarget
      )}
    </motion.div>
  );
}
