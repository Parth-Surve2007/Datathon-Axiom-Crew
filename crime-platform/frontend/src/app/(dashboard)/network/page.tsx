"use client";

import { useRef, useState } from "react";
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
  Eye,
  EyeOff,
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
  const [hoveredId, setHoveredId] = useState("");
  const [riskOnly, setRiskOnly] = useState(false);
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const graphRef = useRef<HTMLDivElement>(null);
  const iconByKind: Record<NodeKind, LucideIcon> = { Person: UserRound, Case: FileText, Asset: Car, Place: MapPin, Organisation: Building2 };
  const nodes: GraphNode[] = (data?.network.nodes ?? []).map((node) => ({
    ...node,
    icon: iconByKind[node.kind],
    x: positions[node.id]?.x ?? node.x,
    y: positions[node.id]?.y ?? node.y,
  }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: GraphEdge[] = (data?.network.edges ?? []).filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const activeId = hoveredId || selected?.id;
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
  const activeEdges = activeId ? edges.filter((edge) => edge.source === activeId || edge.target === activeId) : [];
  const activeNodeIds = new Set(activeEdges.flatMap((edge) => [edge.source, edge.target]));
  const connectedNodes = directEdges.flatMap((edge) => {
    const connectedId = edge.source === selected.id ? edge.target : edge.source;
    const node = nodes.find((item) => item.id === connectedId);
    return node ? [{ edge, node }] : [];
  });

  const resetView = () => {
    setQuery("");
    setFilter("All");
    setRiskOnly(false);
    setShowAllLinks(false);
    setZoom(1);
    setPositions({});
    setSelectedId(nodes[0]?.id ?? "");
  };

  const moveNode = (node: GraphNode, offsetX: number, offsetY: number) => {
    const bounds = graphRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = Math.min(94, Math.max(6, node.x + (offsetX / bounds.width) * 100));
    const y = Math.min(91, Math.max(9, node.y + (offsetY / bounds.height) * 100));
    setPositions((current) => ({ ...current, [node.id]: { x, y } }));
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
            <div className="flex max-w-full items-center gap-2 overflow-x-auto">
              <div className="thin-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-[#f1f3f4] p-1">
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
              <button
                type="button"
                aria-pressed={showAllLinks}
                onClick={() => setShowAllLinks((current) => !current)}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-3 text-xs font-semibold transition ${
                  showAllLinks
                    ? "border-[#182033] bg-[#182033] text-white"
                    : "border-[#dce1e5] bg-white text-[#59636f] hover:border-[#bfc7cd]"
                }`}
              >
                {showAllLinks ? <EyeOff aria-hidden size={15} /> : <Eye aria-hidden size={15} />}
                {showAllLinks ? "Focus links" : "Show all links"}
              </button>
            </div>
          </div>

          <div className="thin-scrollbar relative min-h-[500px] overflow-auto rounded-[26px] border border-white/80 bg-[#edf2f4] shadow-[inset_0_1px_0_rgba(255,255,255,.9),inset_0_0_80px_rgba(117,167,211,.08)] sm:min-h-[570px]">
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
              ref={graphRef}
              animate={{ scale: zoom }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
              className="relative -mt-11 min-w-[760px] origin-center"
              style={{ aspectRatio: `${GRAPH_WIDTH} / ${GRAPH_HEIGHT}` }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(24,32,51,.13) 1px, transparent 1.2px), radial-gradient(circle at 50% 46%, rgba(117,167,211,.28), transparent 38%), radial-gradient(circle at 18% 70%, rgba(40,122,113,.14), transparent 25%)",
                  backgroundSize: "22px 22px, 100% 100%, 100% 100%",
                }}
              />
              <motion.div aria-hidden animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-1/2 size-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#75a7d3]/20 bg-white/10 shadow-[0_0_80px_rgba(117,167,211,.14)]" />
              <div aria-hidden className="absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#182033]/[0.055]" />

              {edges.map((edge, index) => {
                const geometry = edgeGeometry(edge, nodes);
                if (!geometry) return null;
                const isDirect = edge.source === activeId || edge.target === activeId;
                const isDimmed = !matchingIds.has(edge.source) && !matchingIds.has(edge.target);
                const edgeOpacity = isDimmed ? 0.04 : isDirect ? 0.92 : showAllLinks ? 0.2 : 0.035;

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
                        animate={{ scaleX: 1, opacity: edgeOpacity }}
                        transition={{ delay: reduceMotion ? 0 : 0.18 + index * 0.07, duration: 0.75, ease: EASE }}
                        className={`h-full w-full origin-left ${isDirect ? "bg-[#d9482b]" : "bg-[#71808d]"}`}
                        style={{ height: isDirect ? 2 : 1 }}
                      />
                    </div>
                    <AnimatePresence>
                      {isDirect && (
                        <motion.span
                          aria-hidden
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f0b7aa] bg-[#fff7f5]/95 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#b63a23] shadow-sm backdrop-blur"
                          style={{ left: geometry.labelLeft, top: geometry.labelTop }}
                        >
                          {edge.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {nodes.map((node, index) => {
                const isSelected = node.id === selected.id;
                const isMatch = matchingIds.has(node.id);
                const isConnected = activeNodeIds.has(node.id);
                const tone = kindTone[node.kind];
                const Icon = node.icon;
                const nodeOpacity = !isMatch ? 0.12 : isSelected || isConnected || showAllLinks ? 1 : 0.38;

                return (
                  <div
                    key={node.id}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <motion.div
                      animate={reduceMotion ? undefined : { y: [0, -4 - (index % 3), 0] }}
                      transition={{ duration: 4.8 + (index % 4) * 0.55, delay: index * 0.11, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.button
                        type="button"
                        drag
                        dragMomentum={false}
                        dragSnapToOrigin
                        onDragEnd={(_, info) => moveNode(node, info.offset.x, info.offset.y)}
                        onPointerEnter={() => setHoveredId(node.id)}
                        onPointerLeave={() => setHoveredId("")}
                        onFocus={() => setHoveredId(node.id)}
                        onBlur={() => setHoveredId("")}
                        onClick={() => setSelectedId(node.id)}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.55 }}
                        animate={{ opacity: nodeOpacity, scale: isSelected ? 1.07 : isConnected ? 1 : 0.94 }}
                        whileHover={reduceMotion ? undefined : { y: -3, scale: isSelected ? 1.1 : 1.04 }}
                        whileTap={{ scale: 0.97, cursor: "grabbing" }}
                        transition={{ delay: reduceMotion ? 0 : 0.28 + index * 0.045, type: "spring", stiffness: 290, damping: 23 }}
                        aria-label={`${node.label}, ${node.kind}, risk ${node.risk}. Drag to reposition or select to inspect.`}
                        className={`group relative flex min-h-[62px] w-[150px] cursor-grab touch-none select-none items-center gap-3 rounded-[20px] border bg-white/90 p-3 text-left backdrop-blur-xl transition-[border-color,box-shadow] active:cursor-grabbing ${
                          isSelected
                            ? "border-[#d9482b] shadow-[0_22px_55px_rgba(217,72,43,0.2)]"
                            : isConnected
                              ? "border-white shadow-[0_18px_40px_rgba(24,32,51,0.14)] hover:border-[#cfd6db]"
                              : "border-white/80 shadow-[0_10px_24px_rgba(24,32,51,0.08)] hover:border-[#cfd6db]"
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
                    </motion.div>
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
