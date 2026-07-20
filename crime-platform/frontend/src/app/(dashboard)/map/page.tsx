"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Crosshair,
  Filter,
  Layers3,
  LocateFixed,
  MapPin,
  Navigation,
  Radio,
  Route,
  ShieldAlert,
} from "lucide-react";
import { LiveDataState } from "@/components/LiveDataState";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

type IncidentType = "Property" | "Cyber" | "Violent" | "Financial" | "Narcotic";

type Hotspot = {
  id: string;
  label: string;
  district: string;
  station: string;
  type: IncidentType;
  cases: number;
  change: string;
  risk: "Critical" | "Elevated" | "Watch";
  x: number;
  y: number;
  summary: string;
  updated: string;
};

const roads = [
  { left: 8, top: 48, width: 84, rotate: -4, major: true },
  { left: 22, top: 18, width: 70, rotate: 52, major: true },
  { left: 28, top: 82, width: 63, rotate: -50, major: true },
  { left: 12, top: 31, width: 72, rotate: 12, major: false },
  { left: 14, top: 68, width: 72, rotate: -15, major: false },
  { left: 38, top: 8, width: 61, rotate: 76, major: false },
  { left: 52, top: 7, width: 70, rotate: 102, major: false },
  { left: 3, top: 59, width: 46, rotate: 31, major: false },
  { left: 54, top: 31, width: 40, rotate: 25, major: false },
];

const neighbourhoods = [
  { label: "NORTH", left: 43, top: 9 },
  { label: "WEST", left: 14, top: 48 },
  { label: "CBD", left: 43, top: 49 },
  { label: "EAST", left: 76, top: 45 },
  { label: "SOUTH", left: 52, top: 84 },
];

const filters: Array<"All" | IncidentType> = ["All", "Property", "Cyber", "Violent", "Financial", "Narcotic"];
const ranges = ["24h", "7d", "30d"] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

const riskTone = {
  Critical: "bg-[#d9482b] text-white",
  Elevated: "bg-[#f1b45d] text-[#5c3a08]",
  Watch: "bg-[#75a7d3] text-white",
};

export default function CrimeMap() {
  const reduceMotion = useReducedMotion();
  const { data, error, loading, refresh } = useLiveIntelligence();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [range, setRange] = useState<(typeof ranges)[number]>("7d");
  const [selectedId, setSelectedId] = useState("");
  const hotspots: Hotspot[] = (data?.hotspots ?? []).map((item) => ({ ...item, type: `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}` as IncidentType }));

  const filteredHotspots = hotspots.filter((hotspot) => filter === "All" || hotspot.type === filter);

  const selected = hotspots.find((hotspot) => hotspot.id === selectedId) ?? hotspots[0];
  const totalCases = filteredHotspots.reduce((total, hotspot) => total + hotspot.cases, 0);

  const changeFilter = (nextFilter: (typeof filters)[number]) => {
    setFilter(nextFilter);
    const firstMatch = hotspots.find((hotspot) => nextFilter === "All" || hotspot.type === nextFilter);
    if (firstMatch) setSelectedId(firstMatch.id);
  };

  if (loading || error || !data) return <LiveDataState loading={loading} error={error} onRetry={refresh} />;

  return (
    <div className="space-y-5 pb-2 sm:space-y-6">
      <motion.header
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.55, ease: EASE }}
        className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9482b]">
            <Navigation aria-hidden size={14} />
            Live spatial command
          </div>
          <h1 className="text-[clamp(2.15rem,5vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-[#182033]">
            Geospatial intelligence
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d7581] sm:text-base">
            Monitor incident density, patrol coverage, and emerging risk across Bengaluru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-2xl border border-[#d7dde2] bg-white p-1 shadow-[0_10px_30px_rgba(24,32,51,0.06)]">
            {ranges.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                aria-pressed={range === item}
                className={`relative min-h-10 min-w-14 rounded-xl px-3 text-xs font-semibold transition-colors ${
                  range === item ? "text-white" : "text-[#6d7581] hover:text-[#182033]"
                }`}
              >
                {range === item && (
                  <motion.span
                    layoutId="map-range"
                    className="absolute inset-0 rounded-xl bg-[#182033]"
                    transition={{ type: "spring", stiffness: 320, damping: 29 }}
                  />
                )}
                <span className="relative z-10">{item}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => changeFilter("All")}
            className="flex min-h-12 items-center gap-2 rounded-2xl border border-[#d7dde2] bg-white px-4 text-sm font-semibold text-[#182033] shadow-[0_10px_30px_rgba(24,32,51,0.06)] transition hover:-translate-y-0.5 hover:border-[#c7cfd5]"
          >
            <Filter aria-hidden size={17} />
            Reset view
          </button>
        </div>
      </motion.header>

      <section aria-label="Map summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Signals mapped", value: totalCases.toString(), icon: Radio, accent: "#d9482b" },
          { label: "Active hotspots", value: filteredHotspots.length.toString().padStart(2, "0"), icon: ShieldAlert, accent: "#182033" },
          { label: "Units in range", value: "24", icon: Route, accent: "#287a71" },
          { label: "Median response", value: "08m", icon: Clock3, accent: "#75a7d3" },
        ].map((stat, index) => (
          <motion.article
            key={stat.label}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.08 + index * 0.06, duration: 0.48, ease: EASE }}
            className="dashboard-surface lift-card rounded-[22px] p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6d7581]">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#182033] sm:text-3xl">{stat.value}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#f3f5f6]" style={{ color: stat.accent }}>
                <stat.icon aria-hidden size={18} />
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.7fr)]">
        <motion.section
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.62, ease: EASE }}
          className="dashboard-surface rounded-[28px] p-3 sm:rounded-[32px] sm:p-5"
          aria-labelledby="map-title"
        >
          <div className="mb-4 flex flex-col gap-4 px-1 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="live-dot size-2 rounded-full bg-[#287a71]" />
                <h2 id="map-title" className="text-lg font-semibold tracking-[-0.025em] text-[#182033]">
                  Bengaluru command region
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#6d7581]">Synthetic operational view · refreshed 10:42 IST</p>
            </div>
            <div className="thin-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#f1f3f4] p-1">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => changeFilter(item)}
                  className={`min-h-9 whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition ${
                    filter === item ? "bg-white text-[#182033] shadow-sm" : "text-[#6d7581] hover:text-[#182033]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[470px] overflow-hidden rounded-[24px] border border-white/80 bg-[#dbe5ea] sm:min-h-[560px]">
            <div
              aria-hidden
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(24,32,51,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(24,32,51,.045) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            <motion.div
              aria-hidden
              animate={reduceMotion ? undefined : { scale: [0.96, 1.05, 0.96], opacity: [0.32, 0.55, 0.32] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute -right-16 -top-20 size-72 rounded-full bg-white/70 blur-3xl"
            />

            <div className="absolute inset-x-[5%] bottom-[7%] top-[7%]">
              <div
                aria-hidden
                className="absolute inset-0 overflow-hidden bg-[#eef2f3] shadow-[0_28px_70px_rgba(24,32,51,0.14)]"
                style={{
                  clipPath:
                    "polygon(16% 7%, 45% 2%, 68% 9%, 91% 28%, 96% 55%, 84% 83%, 59% 97%, 34% 92%, 12% 77%, 3% 51%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(24,32,51,.16) 1px, transparent 1.25px)",
                    backgroundSize: "13px 13px",
                  }}
                />
                <div className="absolute left-[11%] top-[18%] h-[34%] w-[27%] rotate-[-8deg] rounded-[44%] bg-[#d9e8df]/90" />
                <div className="absolute bottom-[9%] right-[8%] h-[32%] w-[32%] rotate-[13deg] rounded-[46%] bg-[#e8dfcf]/80" />
                <div className="absolute left-[41%] top-[34%] h-[35%] w-[31%] rounded-[45%] bg-white/55" />
              </div>

              {roads.map((road, index) => (
                <div
                  key={`${road.left}-${road.top}-${road.rotate}`}
                  aria-hidden
                  className={`absolute origin-left ${road.major ? "h-[5px]" : "h-[2px]"}`}
                  style={{
                    left: `${road.left}%`,
                    top: `${road.top}%`,
                    width: `${road.width}%`,
                    transform: `rotate(${road.rotate}deg)`,
                  }}
                >
                  <motion.div
                    initial={reduceMotion ? { opacity: 1 } : { scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: road.major ? 0.95 : 0.65 }}
                    transition={{ delay: reduceMotion ? 0 : 0.3 + index * 0.06, duration: 0.75, ease: EASE }}
                    className={`h-full w-full origin-left rounded-full bg-white ${
                      road.major ? "shadow-[0_0_0_1px_rgba(117,167,211,.28)]" : ""
                    }`}
                  />
                </div>
              ))}

              {neighbourhoods.map((area) => (
                <span
                  key={area.label}
                  className="pointer-events-none absolute text-[9px] font-bold tracking-[0.2em] text-[#7f8992]/70 sm:text-[10px]"
                  style={{ left: `${area.left}%`, top: `${area.top}%` }}
                >
                  {area.label}
                </span>
              ))}

              <AnimatePresence>
                {filteredHotspots.map((hotspot, index) => {
                  const isSelected = hotspot.id === selected.id;
                  return (
                    <div
                      key={hotspot.id}
                      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    >
                      <motion.button
                        type="button"
                        aria-label={`${hotspot.label}, ${hotspot.cases} incidents`}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.45 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        whileHover={reduceMotion ? undefined : { y: -5, scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ delay: reduceMotion ? 0 : 0.5 + index * 0.09, type: "spring", stiffness: 300, damping: 21 }}
                        onClick={() => setSelectedId(hotspot.id)}
                        className={`group relative flex size-11 items-center justify-center rounded-2xl border-2 shadow-[0_10px_25px_rgba(24,32,51,0.18)] transition-colors sm:size-12 ${
                          isSelected
                            ? "border-white bg-[#d9482b] text-white"
                            : "border-white bg-[#182033] text-white hover:bg-[#d9482b]"
                        }`}
                      >
                        {isSelected && (
                          <motion.span
                            aria-hidden
                            animate={reduceMotion ? undefined : { scale: [0.8, 1.75], opacity: [0.45, 0] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                            className="absolute inset-0 rounded-2xl border-2 border-[#d9482b]"
                          />
                        )}
                        <MapPin aria-hidden size={19} />
                        <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#182033] shadow-sm">
                          {hotspot.cases}
                        </span>
                      </motion.button>
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#182033] shadow-sm backdrop-blur sm:left-5 sm:top-5">
              <Layers3 aria-hidden size={14} className="text-[#75a7d3]" />
              Crime density
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 text-[10px] font-semibold text-[#6d7581] shadow-sm backdrop-blur sm:bottom-5 sm:left-5">
              <span className="size-2 rounded-full bg-[#d9482b]" /> Critical
              <span className="ml-1 size-2 rounded-full bg-[#75a7d3]" /> Watch
            </div>
            <div className="absolute bottom-3 right-3 flex size-11 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-[#182033] shadow-sm backdrop-blur sm:bottom-5 sm:right-5">
              <LocateFixed aria-hidden size={18} />
            </div>
          </div>
        </motion.section>

        <motion.aside
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.3, duration: 0.58, ease: EASE }}
          className="grid content-start gap-5"
        >
          <section className="dashboard-surface rounded-[28px] p-5 sm:p-6" aria-labelledby="selection-title">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6d7581]">Selected signal</p>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${riskTone[selected.risk]}`}>
                {selected.risk}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -7, filter: "blur(2px)" }}
                transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: EASE }}
              >
                <div className="mt-5 flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fbeae5] text-[#d9482b]">
                    <Crosshair aria-hidden size={21} />
                  </div>
                  <div>
                    <h2 id="selection-title" className="text-xl font-semibold leading-tight tracking-[-0.035em] text-[#182033]">
                      {selected.label}
                    </h2>
                    <p className="mt-1 text-xs text-[#6d7581]">{selected.district}</p>
                  </div>
                </div>

                <div className="my-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#f2f4f5] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6d7581]">Reports</p>
                    <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#182033]">{selected.cases}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f2f4f5] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6d7581]">vs baseline</p>
                    <p className={`mt-1 text-2xl font-semibold tracking-[-0.04em] ${selected.change.startsWith("+") ? "text-[#d9482b]" : "text-[#287a71]"}`}>
                      {selected.change}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-6 text-[#56606d]">{selected.summary}</p>
                <div className="mt-5 border-t border-[#e2e6e9] pt-4">
                  <p className="text-xs font-semibold text-[#182033]">{selected.station}</p>
                  <p className="mt-1 text-[11px] text-[#7a838d]">Updated {selected.updated} · {selected.type}</p>
                </div>
                <button
                  type="button"
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#182033] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#29344b]"
                >
                  Open incident cluster <ArrowUpRight aria-hidden size={16} />
                </button>
              </motion.div>
            </AnimatePresence>
          </section>

          <section className="dashboard-surface rounded-[28px] p-5 sm:p-6" aria-labelledby="ranking-title">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9482b]">Priority queue</p>
                <h2 id="ranking-title" className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[#182033]">Hotspot ranking</h2>
              </div>
              <Activity aria-hidden size={19} className="text-[#75a7d3]" />
            </div>
            <div className="mt-4 space-y-1">
              {hotspots.slice(0, 4).map((hotspot, index) => (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => {
                    setFilter("All");
                    setSelectedId(hotspot.id);
                  }}
                  className={`group flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left transition ${
                    selected.id === hotspot.id ? "bg-[#fbeae5]" : "hover:bg-[#f3f5f6]"
                  }`}
                >
                  <span className="w-5 text-xs font-semibold text-[#9aa2aa]">0{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#182033]">{hotspot.label}</span>
                    <span className="mt-0.5 block text-[11px] text-[#7a838d]">{hotspot.type} · {hotspot.updated}</span>
                  </span>
                  <span className="text-sm font-semibold text-[#182033]">{hotspot.cases}</span>
                  <ArrowUpRight aria-hidden size={14} className="text-[#a2aab1] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#d9482b]" />
                </button>
              ))}
            </div>
          </section>
        </motion.aside>
      </div>
    </div>
  );
}
