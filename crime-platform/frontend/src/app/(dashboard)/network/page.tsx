"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  Car,
  ChevronRight,
  Crosshair,
  FileText,
  Focus,
  MapPin,
  Minus,
  Network as NetworkIcon,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  UserRound,
  UsersRound,
  Waypoints,
} from "lucide-react";
import { LiveDataState } from "@/components/LiveDataState";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

type NodeKind = "Person" | "Case" | "Asset" | "Place" | "Organisation";

type GraphNode = {
  id: string;
  label: string;
  subtitle: string;
  kind: NodeKind;
  icon: LucideIcon;
  risk: number;
  x: number;
  y: number;
  attributes: Array<{ label: string; value: string }>;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  strength: number;
};

const filters: Array<"All" | NodeKind> = ["All", "Person", "Case", "Asset", "Place", "Organisation"];
const EASE = [0.22, 1, 0.36, 1] as const;
const GRAPH_WIDTH = 1000;
const GRAPH_HEIGHT = 620;

const kindTone: Record<NodeKind, { accent: string; soft: string }> = {
  Person: { accent: "#d9482b", soft: "#fbeae5" },
  Case: { accent: "#182033", soft: "#e9ecf0" },
  Asset: { accent: "#5f91bd", soft: "#e5eef5" },
  Place: { accent: "#287a71", soft: "#e1eeea" },
  Organisation: { accent: "#b47721", soft: "#f5ead7" },
};

function edgeGeometry(edge: GraphEdge, nodes: GraphNode[]) {
  const source = nodes.find((node) => node.id === edge.source);
  const target = nodes.find((node) => node.id === edge.target);
  if (!source || !target) return null;
  const x1 = (source.x / 100) * GRAPH_WIDTH;
  const y1 = (source.y / 100) * GRAPH_HEIGHT;
  const x2 = (target.x / 100) * GRAPH_WIDTH;
  const y2 = (target.y / 100) * GRAPH_HEIGHT;
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  return {
    left: `${source.x}%`,
    top: `${source.y}%`,
    width: `${(distance / GRAPH_WIDTH) * 100}%`,
    angle,
    labelLeft: `${(source.x + target.x) / 2}%`,
    labelTop: `${(source.y + target.y) / 2}%`,
  };
}

export default function NetworkGraph() {
  const reduceMotion = useReducedMotion();
  const { data, error, loading, refresh } = useLiveIntelligence();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState("");
  const [riskOnly, setRiskOnly] = useState(false);
  const [zoom, setZoom] = useState(1);
  const iconByKind: Record<NodeKind, LucideIcon> = { Person: UserRound, Case: FileText, Asset: Car, Place: MapPin, Organisation: Building2 };
  const nodes: GraphNode[] = (data?.network.nodes ?? []).map((node) => ({ ...node, icon: iconByKind[node.kind] }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: GraphEdge[] = (data?.network.edges ?? []).filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const normalizedQuery = query.trim().toLowerCase();

  const matchingIds = new Set(
    nodes
      .filter((node) => {
        const matchesType = filter === "All" || node.kind === filter;
        const matchesRisk = !riskOnly || node.risk >= 75;
        const matchesQuery = !normalizedQuery || `${node.label} ${node.subtitle} ${node.kind}`.toLowerCase().includes(normalizedQuery);
        return matchesType && matchesRisk && matchesQuery;
      })
      .map((node) => node.id),
  );

  const directEdges = selected ? edges.filter((edge) => edge.source === selected.id || edge.target === selected.id) : [];
  const connectedNodes = directEdges.flatMap((edge) => {
    const connectedId = edge.source === selected.id ? edge.target : edge.source;
    const node = nodes.find((item) => item.id === connectedId);
    return node ? [{ edge, node }] : [];
  });

  const resetView = () => {
    setQuery("");
    setFilter("All");
    setRiskOnly(false);
    setZoom(1);
    setSelectedId(nodes[0]?.id ?? "");
  };

  if (loading || error || !data || !selected) return <LiveDataState loading={loading} error={error || (!loading && data ? "No linked entities were found in Catalyst." : null)} onRetry={refresh} />;

  return (
    <div className="space-y-5 pb-2 sm:space-y-6">
      <motion.header
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.55, ease: EASE }}
        className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9482b]">
            <NetworkIcon aria-hidden size={14} />
            Entity relationship engine
          </div>
          <h1 className="text-[clamp(2.15rem,5vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-[#182033]">
            Syndicate nexus
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d7581] sm:text-base">
            Trace the people, assets, places, and evidence connecting an active investigation.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <label className="relative block min-w-0 flex-1 xl:w-80">
            <span className="sr-only">Search graph entities</span>
            <Search aria-hidden size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a939c]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search person, FIR or asset..."
              className="min-h-12 w-full rounded-2xl border border-[#d7dde2] bg-white py-3 pl-11 pr-4 text-sm text-[#182033] shadow-[0_10px_30px_rgba(24,32,51,0.06)] outline-none transition placeholder:text-[#9ba3aa] focus:border-[#d9482b]/60 focus:ring-4 focus:ring-[#d9482b]/10"
            />
          </label>
          <button
            type="button"
            aria-pressed={riskOnly}
            onClick={() => setRiskOnly((current) => !current)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold shadow-[0_10px_30px_rgba(24,32,51,0.06)] transition hover:-translate-y-0.5 ${
              riskOnly ? "border-[#d9482b] bg-[#d9482b] text-white" : "border-[#d7dde2] bg-white text-[#182033]"
            }`}
          >
            <ShieldAlert aria-hidden size={17} />
            High risk
          </button>
        </div>
      </motion.header>

      <section aria-label="Network summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Mapped entities", value: String(nodes.length), icon: Waypoints, accent: "#182033" },
          { label: "Strong links", value: String(edges.filter((edge) => edge.strength >= 85).length).padStart(2, "0"), icon: NetworkIcon, accent: "#d9482b" },
          { label: "Persons of interest", value: String(nodes.filter((node) => node.kind === "Person").length).padStart(2, "0"), icon: UsersRound, accent: "#75a7d3" },
          { label: "Average risk", value: `${Math.round(nodes.reduce((sum, node) => sum + node.risk, 0) / Math.max(nodes.length, 1))}%`, icon: Activity, accent: "#287a71" },
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.68fr)]">
        <motion.section
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.62, ease: EASE }}
          className="dashboard-surface rounded-[28px] p-3 sm:rounded-[32px] sm:p-5"
          aria-labelledby="graph-title"
        >
          <div className="mb-4 flex flex-col gap-4 px-1 pt-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="live-dot size-2 rounded-full bg-[#287a71]" />
                <h2 id="graph-title" className="text-lg font-semibold tracking-[-0.025em] text-[#182033]">
                  FIR 042 relationship map
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#6d7581]">
                {matchingIds.size} matching entities · synthetic intelligence dataset
              </p>
            </div>
            <div className="thin-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#f1f3f4] p-1">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                  className={`min-h-9 whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition ${
                    filter === item ? "bg-white text-[#182033] shadow-sm" : "text-[#6d7581] hover:text-[#182033]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="thin-scrollbar relative min-h-[500px] overflow-auto rounded-[24px] border border-[#e1e6e9] bg-[#eef2f3] sm:min-h-[570px]">
            <div className="sticky left-3 top-3 z-30 flex w-fit items-center gap-1 rounded-2xl border border-white bg-white/90 p-1 shadow-[0_12px_28px_rgba(24,32,51,0.1)] backdrop-blur">
              <button
                type="button"
                onClick={() => setZoom((current) => Math.max(0.85, Number((current - 0.1).toFixed(2))))}
                aria-label="Zoom out"
                className="flex size-9 items-center justify-center rounded-xl text-[#6d7581] transition hover:bg-[#eef1f3] hover:text-[#182033]"
              >
                <Minus aria-hidden size={16} />
              </button>
              <span className="w-11 text-center text-[10px] font-bold text-[#6d7581]">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((current) => Math.min(1.2, Number((current + 0.1).toFixed(2))))}
                aria-label="Zoom in"
                className="flex size-9 items-center justify-center rounded-xl text-[#6d7581] transition hover:bg-[#eef1f3] hover:text-[#182033]"
              >
                <Plus aria-hidden size={16} />
              </button>
              <span className="mx-1 h-5 w-px bg-[#dde2e5]" />
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset network view"
                className="flex size-9 items-center justify-center rounded-xl text-[#6d7581] transition hover:bg-[#eef1f3] hover:text-[#182033]"
              >
                <RotateCcw aria-hidden size={15} />
              </button>
            </div>

            <motion.div
              animate={{ scale: zoom }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
              className="relative -mt-11 min-w-[760px] origin-center"
              style={{ aspectRatio: `${GRAPH_WIDTH} / ${GRAPH_HEIGHT}` }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-45"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(24,32,51,.15) 1px, transparent 1.25px), radial-gradient(circle at 50% 48%, rgba(117,167,211,.22), transparent 34%)",
                  backgroundSize: "18px 18px, 100% 100%",
                }}
              />
              <div aria-hidden className="absolute left-1/2 top-1/2 size-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#75a7d3]/20" />
              <div aria-hidden className="absolute left-1/2 top-1/2 size-[67%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#182033]/[0.06]" />

              {edges.map((edge, index) => {
                const geometry = edgeGeometry(edge, nodes);
                if (!geometry) return null;
                const isDirect = edge.source === selected.id || edge.target === selected.id;
                const isDimmed = !matchingIds.has(edge.source) && !matchingIds.has(edge.target);

                return (
                  <div key={edge.id}>
                    <div
                      aria-hidden
                      className="absolute z-0 h-px origin-left"
                      style={{
                        left: geometry.left,
                        top: geometry.top,
                        width: geometry.width,
                        transform: `rotate(${geometry.angle}deg)`,
                      }}
                    >
                      <motion.div
                        initial={reduceMotion ? { opacity: 1 } : { scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: isDimmed ? 0.12 : isDirect ? 0.95 : 0.48 }}
                        transition={{ delay: reduceMotion ? 0 : 0.18 + index * 0.07, duration: 0.75, ease: EASE }}
                        className={`h-full w-full origin-left ${isDirect ? "bg-[#d9482b]" : "bg-[#71808d]"}`}
                        style={{ height: isDirect ? 2 : 1 }}
                      />
                    </div>
                    <motion.span
                      aria-hidden
                      animate={{ opacity: isDimmed ? 0.1 : isDirect ? 1 : 0.62 }}
                      className={`absolute z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${
                        isDirect
                          ? "border-[#f0b7aa] bg-[#fff7f5] text-[#b63a23]"
                          : "border-white bg-white/80 text-[#7d8790]"
                      }`}
                      style={{ left: geometry.labelLeft, top: geometry.labelTop }}
                    >
                      {edge.label}
                    </motion.span>
                  </div>
                );
              })}

              {nodes.map((node, index) => {
                const isSelected = node.id === selected.id;
                const isMatch = matchingIds.has(node.id);
                const tone = kindTone[node.kind];
                const Icon = node.icon;

                return (
                  <div
                    key={node.id}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setSelectedId(node.id)}
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.45, y: 18 }}
                      animate={{ opacity: isMatch || isSelected ? 1 : 0.28, scale: isSelected ? 1.08 : 1, y: 0 }}
                      whileHover={reduceMotion ? undefined : { y: -5, scale: isSelected ? 1.1 : 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ delay: reduceMotion ? 0 : 0.35 + index * 0.08, type: "spring", stiffness: 290, damping: 23 }}
                      className={`group relative flex min-h-[62px] w-[150px] items-center gap-3 rounded-[20px] border bg-white p-3 text-left shadow-[0_13px_30px_rgba(24,32,51,0.12)] transition-colors ${
                        isSelected ? "border-[#d9482b]" : "border-white hover:border-[#cfd6db]"
                      } ${node.kind === "Case" ? "w-[166px]" : ""}`}
                    >
                      {isSelected && (
                        <motion.span
                          aria-hidden
                          animate={reduceMotion ? undefined : { scale: [0.92, 1.18], opacity: [0.32, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                          className="absolute inset-[-6px] rounded-[24px] border-2 border-[#d9482b]"
                        />
                      )}
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ color: tone.accent, background: tone.soft }}>
                        <Icon aria-hidden size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-[#182033]">{node.label}</span>
                        <span className="mt-0.5 block truncate text-[9px] text-[#7d8690]">{node.subtitle}</span>
                      </span>
                      <span
                        className="absolute -right-2 -top-2 rounded-full border-2 border-white px-2 py-1 text-[8px] font-bold text-white shadow-sm"
                        style={{ background: node.risk >= 85 ? "#d9482b" : node.risk >= 70 ? "#d99522" : "#75a7d3" }}
                      >
                        {node.risk}
                      </span>
                    </motion.button>
                  </div>
                );
              })}

              {matchingIds.size === 0 && (
                <div className="absolute left-1/2 top-1/2 z-20 w-72 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white bg-white/95 p-5 text-center shadow-xl">
                  <Search aria-hidden size={20} className="mx-auto text-[#d9482b]" />
                  <p className="mt-3 text-sm font-semibold text-[#182033]">No exact entity match</p>
                  <button type="button" onClick={resetView} className="mt-2 text-xs font-semibold text-[#d9482b] hover:underline">
                    Clear graph filters
                  </button>
                </div>
              )}
            </motion.div>

            <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7a838c] backdrop-blur sm:hidden">
              Swipe to inspect graph
            </p>
          </div>
        </motion.section>

        <motion.aside
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.3, duration: 0.58, ease: EASE }}
          className="grid content-start gap-5"
        >
          <section className="dashboard-surface rounded-[28px] p-5 sm:p-6" aria-labelledby="entity-title">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -7, filter: "blur(2px)" }}
                transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: EASE }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6d7581]">Selected entity</p>
                  <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: kindTone[selected.kind].accent, background: kindTone[selected.kind].soft }}>
                    {selected.kind}
                  </span>
                </div>

                <div className="mt-5 flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl" style={{ color: kindTone[selected.kind].accent, background: kindTone[selected.kind].soft }}>
                    <selected.icon aria-hidden size={21} />
                  </div>
                  <div className="min-w-0">
                    <h2 id="entity-title" className="truncate text-xl font-semibold tracking-[-0.035em] text-[#182033]">{selected.label}</h2>
                    <p className="mt-1 text-xs text-[#6d7581]">{selected.subtitle}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f2f4f5] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#59636f]">Risk relevance</span>
                    <span className="font-bold text-[#182033]">{selected.risk}/100</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <motion.div
                      key={selected.id}
                      initial={reduceMotion ? { width: `${selected.risk}%` } : { width: 0 }}
                      animate={{ width: `${selected.risk}%` }}
                      transition={{ duration: reduceMotion ? 0 : 0.65, ease: EASE }}
                      className="h-full rounded-full"
                      style={{ background: selected.risk >= 85 ? "#d9482b" : selected.risk >= 70 ? "#d99522" : "#75a7d3" }}
                    />
                  </div>
                </div>

                <dl className="mt-5 space-y-3">
                  {selected.attributes.map((attribute) => (
                    <div key={attribute.label} className="flex items-start justify-between gap-4 border-b border-[#e5e8ea] pb-3 last:border-0 last:pb-0">
                      <dt className="text-xs text-[#7b848d]">{attribute.label}</dt>
                      <dd className="text-right text-xs font-semibold text-[#182033]">{attribute.value}</dd>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#182033] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#29344b]"
                >
                  Open intelligence file <ChevronRight aria-hidden size={16} />
                </button>
              </motion.div>
            </AnimatePresence>
          </section>

          <section className="dashboard-surface rounded-[28px] p-5 sm:p-6" aria-labelledby="links-title">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9482b]">Relationship trail</p>
                <h2 id="links-title" className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[#182033]">Direct links</h2>
              </div>
              <Focus aria-hidden size={19} className="text-[#75a7d3]" />
            </div>
            <div className="mt-4 space-y-1">
              {connectedNodes.map(({ edge, node }) => {
                const Icon = node.icon;
                return (
                  <button
                    key={edge.id}
                    type="button"
                    onClick={() => setSelectedId(node.id)}
                    className="group flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left transition hover:bg-[#f3f5f6]"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ color: kindTone[node.kind].accent, background: kindTone[node.kind].soft }}>
                      <Icon aria-hidden size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#182033]">{node.label}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-[0.08em] text-[#89929a]">{edge.label} · {edge.strength}%</span>
                    </span>
                    <ChevronRight aria-hidden size={14} className="text-[#a2aab1] transition group-hover:translate-x-0.5 group-hover:text-[#d9482b]" />
                  </button>
                );
              })}
              {connectedNodes.length === 0 && (
                <div className="rounded-2xl bg-[#f3f5f6] p-4 text-xs leading-5 text-[#6d7581]">
                  No direct links are recorded for this entity.
                </div>
              )}
            </div>
          </section>

          <div className="rounded-[26px] bg-[#dce3e8] p-5 text-[#182033] shadow-[0_18px_45px_rgba(24,32,51,0.08)]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d9482b]">
              <Crosshair aria-hidden size={14} /> KrimeAI observation
            </div>
            <p className="mt-3 text-sm leading-6 text-[#4f5a66]">
              The device and vehicle intersect within a 19-minute window near the FIR location, raising the combined pattern confidence to 87%.
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
