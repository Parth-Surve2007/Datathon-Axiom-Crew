"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CircleDot,
  Clock3,
  Fingerprint,
  MapPin,
  Plus,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type RangeKey = "Week" | "Month" | "Quarter";

const pulseData: Record<RangeKey, { labels: string[]; values: number[]; change: number; total: number; comparison: string }> = {
  Week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [64, 83, 112, 78, 124, 96, 82],
    change: 18,
    total: 639,
    comparison: "lower than last week",
  },
  Month: {
    labels: ["W1", "W2", "W3", "W4"],
    values: [612, 548, 684, 571],
    change: 12,
    total: 2415,
    comparison: "lower than last month",
  },
  Quarter: {
    labels: ["Apr", "May", "Jun"],
    values: [2180, 1942, 1766],
    change: 9,
    total: 5888,
    comparison: "lower than last quarter",
  },
};

const investigations = [
  {
    id: "KSP-24-1843",
    title: "Organized Vehicle Theft",
    status: "High priority",
    color: "#d9482b",
    soft: "#fbeae5",
    icon: ShieldAlert,
    district: "Bengaluru East",
    age: "12m ago",
    tags: ["Syndicate link", "3 suspects"],
    detail: "Three recent thefts share the same relay-attack signature. Electronic evidence points to an interstate network.",
  },
  {
    id: "KSP-24-1791",
    title: "Digital Lending Fraud",
    status: "Investigating",
    color: "#287a71",
    soft: "#e5f1ef",
    icon: Fingerprint,
    district: "Mysuru City",
    age: "2h ago",
    tags: ["14 accounts", "Cyber cell"],
    detail: "Transaction clustering has isolated fourteen mule accounts connected to two fraudulent lending applications.",
  },
  {
    id: "KSP-24-1638",
    title: "Warehouse Diversion",
    status: "Charge-sheeted",
    color: "#54779b",
    soft: "#e8eef4",
    icon: ShieldCheck,
    district: "Hubballi-Dharwad",
    age: "1d ago",
    tags: ["Evidence sealed", "Court ready"],
    detail: "Chargesheet review is complete with vehicle telemetry, CCTV correlation, and six verified witness statements.",
  },
];

const fieldUnits = [
  { initials: "NH", name: "Insp. Naveen Hegde", role: "Indiranagar Station", state: "On scene", color: "#d9482b" },
  { initials: "GS", name: "PSI Gita Shekar", role: "Cyber Crime Unit", state: "Available", color: "#54779b" },
];

const pipeline = [
  { label: "FIRs registered", value: 64, color: "#aeb7bf", levels: [34, 58, 44, 76, 60, 88, 55, 70, 46, 82] },
  { label: "Investigations", value: 42, color: "#d9482b", levels: [62, 38, 78, 55, 88, 72, 48, 92, 67, 84] },
  { label: "Charge-sheets", value: 18, color: "#182033", levels: [45, 74, 58, 86, 62, 94, 70, 52, 80, 64] },
  { label: "Closed", value: 10, color: "#287a71", levels: [68, 42, 82, 58, 90, 72, 48, 86, 62, 78] },
];

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.982 },
  show: { opacity: 1, y: 0, scale: 1 },
};

function CountUp({ value, suffix = "", duration = 900 }: { value: number; suffix?: string; duration?: number }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;
    const startTime = performance.now();
    const startValue = display;
    const distance = value - startValue;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(startValue + distance * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // The animation intentionally starts from the currently displayed value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, reduceMotion]);

  return <>{(reduceMotion ? value : display).toLocaleString("en-IN")}{suffix}</>;
}

export default function Dashboard() {
  const reduceMotion = useReducedMotion();
  const [range, setRange] = useState<RangeKey>("Week");
  const [activePoint, setActivePoint] = useState(4);
  const [expandedCase, setExpandedCase] = useState(investigations[0].id);
  const [assignedUnits, setAssignedUnits] = useState<string[]>([]);
  const [briefReady, setBriefReady] = useState(false);
  const currentPulse = pulseData[range];

  const maxValue = useMemo(() => Math.max(...currentPulse.values), [currentPulse.values]);

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : 0.065, delayChildren: 0.04 } } }}
      initial="hidden"
      animate="show"
      className="space-y-5 sm:space-y-6"
    >
      <motion.header variants={cardVariants} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#858e98]">
            <span className="live-dot size-2 rounded-full bg-[#287a71]" />
            Live command workspace
          </div>
          <h1 className="text-[clamp(1.8rem,3vw,2.7rem)] font-semibold leading-none tracking-[-0.055em] text-[#182033]">Good morning, Ananya.</h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#737b86] sm:text-sm">Here is what changed across Karnataka&apos;s active investigations since your last briefing.</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-white/80 bg-white/55 px-3 py-2 text-[10px] font-semibold text-[#65707b] shadow-sm sm:self-auto">
          <Radio size={13} className="text-[#287a71]" />
          State intelligence node active
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <motion.section
          variants={cardVariants}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          className="dashboard-surface lift-card min-h-[410px] rounded-[28px] p-5 sm:min-h-[438px] sm:rounded-[32px] sm:p-7 xl:col-span-7"
          aria-labelledby="incident-pulse-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef1f3] text-[#4f5a67]"><CircleDot size={17} /></span>
                <h2 id="incident-pulse-title" className="text-xl font-semibold tracking-[-0.035em] text-[#182033] sm:text-[28px]">Incident pulse</h2>
              </div>
              <p className="mt-2 max-w-[28rem] text-[11px] leading-relaxed text-[#7b838d] sm:ml-[46px] sm:text-xs">Daily registered incidents across all district control rooms. Select a point to inspect volume.</p>
            </div>
            <label className="relative shrink-0">
              <span className="sr-only">Incident pulse period</span>
              <select
                value={range}
                onChange={(event) => {
                  const nextRange = event.target.value as RangeKey;
                  const nextValues = pulseData[nextRange].values;
                  setRange(nextRange);
                  setActivePoint(nextValues.indexOf(Math.max(...nextValues)));
                }}
                className="h-10 appearance-none rounded-full border border-[#d7dde2] bg-white pl-4 pr-9 text-[11px] font-medium text-[#354052] outline-none transition hover:border-[#bfc7ce] focus:border-[#d9482b]/40"
              >
                <option>Week</option>
                <option>Month</option>
                <option>Quarter</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77808a]" />
            </label>
          </div>

          <div className="mt-5 grid min-h-[285px] grid-cols-1 gap-4 sm:grid-cols-[150px_1fr] sm:items-end">
            <div className="order-2 pb-5 sm:order-1 sm:pb-7">
              <motion.p key={range} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[42px] font-semibold leading-none tracking-[-0.06em] text-[#182033]">
                <CountUp value={currentPulse.change} suffix="%" />
              </motion.p>
              <p className="mt-2 max-w-[140px] text-[11px] leading-snug text-[#7d858f]">Incident load is {currentPulse.comparison}.</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-[#287a71]">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#e5f1ef]">↓</span>
                <span><CountUp value={currentPulse.total} /> total reports</span>
              </div>
            </div>

            <figure className="order-1 h-[228px] min-w-0 sm:order-2 sm:h-[282px]" aria-labelledby="incident-chart-caption">
              <figcaption id="incident-chart-caption" className="sr-only">{range} incident activity. Each point is selectable for its exact incident count.</figcaption>
              <AnimatePresence mode="wait">
                <motion.div key={range} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.32 }} className="flex h-full items-stretch justify-around gap-1">
                  {currentPulse.values.map((value, index) => {
                    const height = 22 + (value / maxValue) * 48;
                    const active = activePoint === index;
                    return (
                      <button
                        key={`${currentPulse.labels[index]}-${value}`}
                        onMouseEnter={() => setActivePoint(index)}
                        onFocus={() => setActivePoint(index)}
                        onClick={() => setActivePoint(index)}
                        className="group relative flex h-full min-w-0 flex-1 items-end justify-center rounded-2xl pb-8 outline-none focus-visible:ring-2 focus-visible:ring-[#d9482b]/45 focus-visible:ring-offset-2"
                        aria-label={`${currentPulse.labels[index]}: ${value} incidents`}
                      >
                        <AnimatePresence>
                          {active && (
                            <motion.span
                              initial={{ opacity: 0, y: 7, scale: 0.82 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.9 }}
                              transition={{ type: "spring", stiffness: 360, damping: 24 }}
                              className="absolute z-20 -translate-y-2 rounded-full bg-[#182033] px-2.5 py-1.5 text-[9px] font-bold text-white shadow-[0_10px_24px_rgba(24,32,51,.25)]"
                              style={{ bottom: `calc(${height}% + 2.1rem)` }}
                            >
                              {value.toLocaleString("en-IN")}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <motion.span
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: reduceMotion ? 0 : index * 0.055 + 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className={`absolute bottom-8 w-px origin-bottom ${active ? "bg-[#94a0aa]" : "bg-[#ced4d9]"}`}
                          style={{ height: `${height}%` }}
                        />
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: reduceMotion ? 0 : index * 0.055 + 0.48, type: "spring", stiffness: 420, damping: 20 }}
                          className={`absolute size-2.5 rounded-full ring-4 ring-white transition-colors ${active ? "bg-[#d9482b] shadow-[0_0_0_5px_rgba(217,72,43,.1)]" : "bg-[#75a7d3] group-hover:bg-[#d9482b]"}`}
                          style={{ bottom: `calc(${height}% + 1.7rem)` }}
                        />
                        <span className={`absolute bottom-0 flex size-8 items-center justify-center rounded-full text-[10px] font-semibold transition-all ${active ? "bg-[#182033] text-white shadow-lg" : "bg-[#e4e8eb] text-[#68717c] group-hover:bg-[#d8dde1]"}`}>{currentPulse.labels[index]}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </figure>
          </div>
        </motion.section>

        <motion.section variants={cardVariants} transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }} className="min-h-[410px] xl:col-span-5" aria-labelledby="priority-title">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Live queue</p>
              <h2 id="priority-title" className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#182033] sm:text-xl">Priority investigations</h2>
            </div>
            <Link href="/analytics" className="group flex items-center gap-1 text-[10px] font-medium text-[#66707b] hover:text-[#182033]">View all cases <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#d7dde2] bg-white/30 sm:rounded-[32px]">
            {investigations.map((investigation, index) => {
              const open = investigation.id === expandedCase;
              const Icon = investigation.icon;
              return (
                <motion.article key={investigation.id} layout="position" className={`${index ? "border-t border-[#d7dde2]" : ""} bg-white/35`}>
                  <button
                    onClick={() => setExpandedCase(open ? "" : investigation.id)}
                    aria-expanded={open}
                    className="flex min-h-[82px] w-full items-center gap-3 p-4 text-left sm:gap-4"
                  >
                    <motion.span layout className="flex size-11 shrink-0 items-center justify-center rounded-2xl" style={{ color: investigation.color, backgroundColor: investigation.soft }} whileHover={{ rotate: -7, scale: 1.08 }}>
                      <Icon size={19} />
                    </motion.span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[12px] font-semibold text-[#273044] sm:text-[13px]">{investigation.title}</span>
                        <span className="rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wide" style={{ color: investigation.color, backgroundColor: investigation.soft }}>{investigation.status}</span>
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-[#7d8691]">
                        <span className="font-mono font-medium text-[#4f5a67]">{investigation.id}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} />{investigation.district}</span>
                      </span>
                    </span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e1e6e9] text-[#65707a]"><ChevronDown size={14} /></motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <div className="px-4 pb-4 pl-[4.5rem] sm:pl-[5rem]">
                          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="max-w-xl text-[10px] leading-relaxed text-[#69727d] sm:text-[11px]">{investigation.detail}</motion.p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {investigation.tags.map((tag) => <span key={tag} className="rounded-full bg-[#e4e8eb] px-2.5 py-1 text-[8px] font-semibold text-[#59636e]">{tag}</span>)}
                            <span className="ml-auto flex items-center gap-1 text-[8px] text-[#89919b]"><Clock3 size={10} /> {investigation.age}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </motion.section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <motion.section variants={cardVariants} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="xl:col-span-7" aria-labelledby="units-title">
          <div className="grid h-full grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <div className="mb-3 flex items-end justify-between px-1">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Deployment</p><h2 id="units-title" className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#182033]">Active field units</h2></div>
                <span className="text-[9px] text-[#7e8791]">12 online</span>
              </div>
              <div className="space-y-3">
                {fieldUnits.map((unit, index) => {
                  const assigned = assignedUnits.includes(unit.name);
                  return (
                    <motion.div key={unit.name} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduceMotion ? 0 : 0.5 + index * 0.08 }} whileHover={{ x: 3 }} className="flex min-h-[72px] items-center gap-3 rounded-[24px] border border-[#d7dde2] bg-white/25 p-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: unit.color }}>{unit.initials}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-[#283144]">{unit.name}</span><span className="mt-0.5 block truncate text-[9px] text-[#858d97]">{unit.role}</span><span className="mt-1 flex items-center gap-1 text-[8px] font-semibold text-[#287a71]"><span className="size-1.5 rounded-full bg-[#287a71]" />{unit.state}</span></span>
                      <motion.button
                        whileTap={{ scale: 0.82, rotate: assigned ? 0 : 90 }}
                        onClick={() => setAssignedUnits((current) => assigned ? current.filter((name) => name !== unit.name) : [...current, unit.name])}
                        aria-label={assigned ? `Remove ${unit.name} from briefing` : `Add ${unit.name} to briefing`}
                        aria-pressed={assigned}
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${assigned ? "bg-[#287a71] text-white" : "bg-white text-[#68727d] shadow-sm"}`}
                      >
                        {assigned ? <ShieldCheck size={14} /> : <Plus size={15} />}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div whileHover={reduceMotion ? undefined : { y: -5, rotateX: 0.6, rotateY: -0.6 }} transition={{ type: "spring", stiffness: 240, damping: 24 }} className="soft-grid relative min-h-[238px] overflow-hidden rounded-[28px] bg-[#cfd9e1] p-5 text-[#182033] shadow-[0_18px_45px_rgba(62,78,94,.12)] sm:p-6">
              <div aria-hidden className="dot-field absolute -right-10 -top-10 size-48 rotate-12 opacity-45" />
              <div className="scan-line" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#596773]"><Sparkles size={13} /> KrimeAI briefing</span>
                  <span className="rounded-full bg-white/50 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#52616e]">87% confidence</span>
                </div>
                <h2 className="mt-5 max-w-[16rem] text-xl font-semibold leading-tight tracking-[-0.04em]">A shared relay-attack signature is emerging.</h2>
                <p className="mt-2 max-w-[18rem] text-[10px] leading-relaxed text-[#5e6c77]">Three vehicle thefts in the east corridor show matching timing, device, and route patterns.</p>
                <button onClick={() => setBriefReady(true)} className="group mt-auto flex min-h-11 w-full items-center justify-between rounded-full bg-white px-4 text-[10px] font-semibold text-[#182033] shadow-sm transition-shadow hover:shadow-lg">
                  <span>{briefReady ? "Brief added to workspace" : "Open intelligence brief"}</span>
                  <motion.span animate={briefReady ? { rotate: 360 } : { rotate: 0 }} className={`flex size-7 items-center justify-center rounded-full ${briefReady ? "bg-[#287a71] text-white" : "bg-[#eef1f3] text-[#182033]"}`}><ArrowUpRight size={13} /></motion.span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section variants={cardVariants} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="dashboard-surface lift-card rounded-[28px] p-5 sm:rounded-[32px] sm:p-6 xl:col-span-5" aria-labelledby="pipeline-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">This month</p><h2 id="pipeline-title" className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#182033] sm:text-xl">Case pipeline</h2></div>
            <button className="flex min-h-10 items-center gap-2 rounded-full border border-[#dde2e6] bg-white px-3 text-[9px] font-medium text-[#5e6873]"><CalendarDays size={13} /> July 2026 <ChevronDown size={11} /></button>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-y-7 sm:grid-cols-4 sm:gap-y-0">
            {pipeline.map((item, columnIndex) => (
              <div key={item.label} className={`min-w-0 px-3 first:pl-0 sm:border-l sm:border-[#d9dfe4] sm:first:border-l-0 ${columnIndex % 2 ? "border-l border-[#d9dfe4]" : ""}`}>
                <p className="min-h-7 text-[9px] leading-snug text-[#7c858f]">{item.label}</p>
                <motion.p key={item.value} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : 0.55 + columnIndex * 0.06 }} className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#182033]"><CountUp value={item.value} /></motion.p>
                <div className="mt-4 flex h-12 items-end gap-[4px] overflow-hidden" aria-hidden>
                  {item.levels.map((level, index) => (
                    <motion.span key={index} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: reduceMotion ? 0 : 0.62 + columnIndex * 0.08 + index * 0.026, duration: 0.48, ease: [0.22, 1, 0.36, 1] }} className="h-full w-px origin-bottom rounded-full" style={{ backgroundColor: item.color, height: `${level}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f2f4f5] px-3 py-2.5 text-[9px] text-[#6f7883]">
            <span className="flex items-center gap-1.5"><Users size={12} /> 84 high-priority cases monitored</span>
            <Link href="/analytics" className="font-semibold text-[#182033] hover:text-[#d9482b]">Full report →</Link>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
