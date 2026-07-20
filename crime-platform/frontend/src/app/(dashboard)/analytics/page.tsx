"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  CalendarRange,
  ChartColumnBig,
  ChevronDown,
  Download,
  Gauge,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const data = [
  { name: "Jan", thefts: 400, assault: 240, fraud: 150 },
  { name: "Feb", thefts: 300, assault: 139, fraud: 220 },
  { name: "Mar", thefts: 200, assault: 980, fraud: 229 },
  { name: "Apr", thefts: 278, assault: 390, fraud: 200 },
  { name: "May", thefts: 189, assault: 480, fraud: 218 },
  { name: "Jun", thefts: 239, assault: 380, fraud: 250 },
];

const trendData = [
  { name: "W1", incidents: 120 },
  { name: "W2", incidents: 132 },
  { name: "W3", incidents: 101 },
  { name: "W4", incidents: 134 },
  { name: "W5", incidents: 90 },
  { name: "W6", incidents: 190 },
];

type PeriodKey = "six-months" | "year-to-date";

const periodLabels: Record<PeriodKey, string> = {
  "six-months": "Last 6 months",
  "year-to-date": "This year",
};

const categoryMeta = [
  { key: "thefts" as const, label: "Thefts", color: "#75a7d3", soft: "#e8f0f7" },
  { key: "assault" as const, label: "Assault", color: "#d9482b", soft: "#fbeae5" },
  { key: "fraud" as const, label: "Fraud", color: "#182033", soft: "#e8eaed" },
];

const monthlyTotals = data.map((month) => ({
  name: month.name,
  value: month.thefts + month.assault + month.fraud,
}));

const categoryTotals = categoryMeta.map((category) => ({
  ...category,
  value: data.reduce((total, month) => total + month[category.key], 0),
}));

const totalIncidents = categoryTotals.reduce((total, category) => total + category.value, 0);
const peakMonth = monthlyTotals.reduce((peak, month) => (month.value > peak.value ? month : peak));
const averagePerMonth = Math.round(totalIncidents / data.length);
const latestWeek = trendData.at(-1)?.incidents ?? 0;
const previousWeek = trendData.at(-2)?.incidents ?? 0;
const weeklyChange = previousWeek ? Math.round(((latestWeek - previousWeek) / previousWeek) * 100) : 0;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.075,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.982 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.64, ease: EASE_OUT },
  },
};

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,.97)",
  border: "1px solid #d7dde2",
  borderRadius: "18px",
  boxShadow: "0 18px 48px rgba(24,32,51,.14)",
  color: "#182033",
  fontSize: "11px",
  padding: "12px 14px",
};

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

export default function Analytics() {
  const reduceMotion = useReducedMotion();
  const [period, setPeriod] = useState<PeriodKey>("six-months");

  const exportReport = () => {
    const rows = [
      ["Month", "Thefts", "Assault", "Fraud", "Total"],
      ...data.map((month) => [
        month.name,
        month.thefts,
        month.assault,
        month.fraud,
        month.thefts + month.assault + month.fraud,
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ksp-crime-telemetry-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      className="space-y-5 sm:space-y-6"
    >
      <motion.header
        variants={cardVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#858e98]">
            <span className="live-dot size-2 rounded-full bg-[#d9482b]" />
            Statewide intelligence model
          </div>
          <h1 className="text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-none tracking-[-0.055em] text-[#182033]">
            Data telemetry
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#737b86] sm:text-sm">
            A focused view of category volume, weekly velocity, and emerging variance across Karnataka&apos;s registered incidents.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={exportReport}
          whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          className="flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-[#182033] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_30px_rgba(24,32,51,.18)] transition-colors hover:bg-[#d9482b] sm:self-auto"
        >
          <Download size={15} />
          Export CSV
        </motion.button>
      </motion.header>

      <section aria-label="Headline telemetry" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {[
          {
            label: "Recorded incidents",
            value: formatNumber(totalIncidents),
            detail: "Across six monthly cohorts",
            icon: Activity,
            accent: "#d9482b",
            levels: [42, 60, 48, 72, 58, 88, 64, 80],
          },
          {
            label: "Monthly average",
            value: formatNumber(averagePerMonth),
            detail: "Incidents per reporting month",
            icon: Gauge,
            accent: "#75a7d3",
            levels: [68, 54, 75, 44, 82, 62, 90, 70],
          },
          {
            label: "Peak volume",
            value: formatNumber(peakMonth.value),
            detail: `${peakMonth.name} was the highest month`,
            icon: ChartColumnBig,
            accent: "#182033",
            levels: [38, 56, 96, 48, 58, 62, 51, 54],
          },
          {
            label: "Latest acceleration",
            value: `+${weeklyChange}%`,
            detail: `${formatNumber(latestWeek)} incidents recorded in W6`,
            icon: ArrowUpRight,
            accent: "#287a71",
            levels: [50, 56, 44, 58, 38, 100, 74, 86],
          },
        ].map((stat, statIndex) => {
          const Icon = stat.icon;
          return (
            <motion.article
              key={stat.label}
              variants={cardVariants}
              whileHover={reduceMotion ? undefined : { y: -5, rotateX: 0.35, rotateY: -0.35 }}
              transition={{ type: "spring", stiffness: 250, damping: 24 }}
              className="dashboard-surface min-h-[152px] rounded-[26px] p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#8b939d]">{stat.label}</p>
                  <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.055em] text-[#182033]">{stat.value}</p>
                  <p className="mt-2 text-[10px] text-[#7b848e]">{stat.detail}</p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl" style={{ color: stat.accent, backgroundColor: `${stat.accent}12` }}>
                  <Icon size={17} />
                </span>
              </div>
              <div aria-hidden className="mt-4 flex h-7 items-end gap-1.5">
                {stat.levels.map((level, barIndex) => (
                  <motion.span
                    key={barIndex}
                    initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: reduceMotion ? 0 : 0.26 + statIndex * 0.08 + barIndex * 0.025, duration: 0.5, ease: EASE_OUT }}
                    className="w-1.5 origin-bottom rounded-full"
                    style={{ height: `${level}%`, backgroundColor: stat.accent, opacity: 0.24 + barIndex * 0.055 }}
                  />
                ))}
              </div>
            </motion.article>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <motion.section
          variants={cardVariants}
          className="dashboard-surface lift-card rounded-[28px] p-4 sm:rounded-[32px] sm:p-6 xl:col-span-8"
          aria-labelledby="distribution-title"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#fbeae5] text-[#d9482b]">
                  <ChartColumnBig size={17} />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Category intelligence</p>
                  <h2 id="distribution-title" className="mt-0.5 text-lg font-semibold tracking-[-0.035em] text-[#182033] sm:text-xl">
                    Incident distribution
                  </h2>
                </div>
              </div>
              <p className="mt-2 max-w-lg text-[10px] leading-relaxed text-[#7b838d] sm:ml-[46px] sm:text-[11px]">
                Monthly registered volume, stacked by the three monitored crime categories.
              </p>
            </div>

            <label className="relative w-full shrink-0 sm:w-auto">
              <span className="sr-only">Distribution period</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as PeriodKey)}
                className="h-11 w-full appearance-none rounded-full border border-[#d7dde2] bg-white pl-10 pr-10 text-[10px] font-semibold text-[#354052] outline-none transition hover:border-[#bcc5cd] focus:border-[#d9482b]/45 sm:w-[158px]"
              >
                <option value="six-months">Last 6 months</option>
                <option value="year-to-date">This year</option>
              </select>
              <CalendarRange size={13} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9482b]" />
              <ChevronDown size={13} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#77808a]" />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 sm:ml-[46px]">
            {categoryMeta.map((category) => (
              <span key={category.key} className="flex items-center gap-2 text-[9px] font-medium text-[#68727d]">
                <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.label}
              </span>
            ))}
          </div>

          <div className="mt-3 h-[310px] min-w-0 sm:h-[360px] lg:h-[390px]" role="img" aria-label={`${periodLabels[period]} incident distribution chart`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={period}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 1.01 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.42, ease: EASE_OUT }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 24, right: 6, left: -22, bottom: 4 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="2 7" vertical={false} stroke="#dfe4e8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#737d88", fontSize: 10, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#929aa3", fontSize: 9 }} />
                    <Tooltip cursor={{ fill: "rgba(117,167,211,.08)", radius: 12 }} contentStyle={tooltipStyle} labelStyle={{ color: "#182033", fontWeight: 700, marginBottom: 5 }} />
                    <Bar dataKey="thefts" name="Thefts" stackId="categories" fill="#75a7d3" radius={[0, 0, 7, 7]} isAnimationActive={!reduceMotion} animationBegin={80} animationDuration={900} animationEasing="ease-out" />
                    <Bar dataKey="assault" name="Assault" stackId="categories" fill="#d9482b" isAnimationActive={!reduceMotion} animationBegin={180} animationDuration={980} animationEasing="ease-out" />
                    <Bar dataKey="fraud" name="Fraud" stackId="categories" fill="#182033" radius={[7, 7, 0, 0]} isAnimationActive={!reduceMotion} animationBegin={280} animationDuration={1060} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-[#e2e6e9] pt-4">
            {categoryTotals.map((category) => (
              <div key={category.key} className="rounded-2xl px-2 py-2.5 sm:px-3" style={{ backgroundColor: category.soft }}>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: category.color }}>{category.label}</p>
                <p className="mt-1 text-base font-semibold tracking-[-0.04em] text-[#182033] sm:text-lg">{formatNumber(category.value)}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="grid gap-5 xl:col-span-4">
          <motion.section
            variants={cardVariants}
            className="dashboard-surface lift-card rounded-[28px] p-4 sm:rounded-[32px] sm:p-6"
            aria-labelledby="weekly-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Weekly signal</p>
                <h2 id="weekly-title" className="mt-1 text-lg font-semibold tracking-[-0.035em] text-[#182033]">Incident velocity</h2>
              </div>
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#e8f0f7] text-[#54779b]"><Activity size={16} /></span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[38px] font-semibold leading-none tracking-[-0.06em] text-[#182033]">{formatNumber(latestWeek)}</p>
                <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7f8892]">Latest weekly total</p>
              </div>
              <span className="rounded-full bg-[#fbeae5] px-3 py-1.5 text-[9px] font-bold text-[#d9482b]">+{weeklyChange}% vs W5</span>
            </div>

            <div className="mt-2 h-[205px] min-w-0" role="img" aria-label="Weekly incident volume area chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 22, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incidentArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#75a7d3" stopOpacity={0.42} />
                      <stop offset="96%" stopColor="#75a7d3" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 7" vertical={false} stroke="#e2e7ea" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#7e8791", fontSize: 9, fontWeight: 600 }} dy={7} />
                  <Tooltip cursor={{ stroke: "#d7dde2", strokeDasharray: "3 4" }} contentStyle={tooltipStyle} labelStyle={{ color: "#182033", fontWeight: 700 }} />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    name="Incidents"
                    stroke="#75a7d3"
                    strokeWidth={3}
                    fill="url(#incidentArea)"
                    dot={{ r: 3, fill: "#ffffff", stroke: "#75a7d3", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#d9482b", stroke: "#ffffff", strokeWidth: 3 }}
                    isAnimationActive={!reduceMotion}
                    animationBegin={180}
                    animationDuration={1150}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            variants={cardVariants}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            className="soft-grid relative overflow-hidden rounded-[28px] bg-[#cfd9e1] p-5 text-[#182033] shadow-[0_18px_45px_rgba(62,78,94,.12)] sm:rounded-[32px] sm:p-6"
            aria-labelledby="automated-analysis-title"
          >
            <motion.div
              aria-hidden
              animate={reduceMotion ? undefined : { x: ["-120%", "320%"], opacity: [0, 0.55, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#596773]"><Sparkles size={13} /> Automated analysis</span>
                <span className="rounded-full bg-white/55 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-[#52616e]">Live model</span>
              </div>
              <h2 id="automated-analysis-title" className="mt-5 max-w-xs text-xl font-semibold leading-tight tracking-[-0.04em]">High variance is concentrated in W6.</h2>
              <p className="mt-2 text-[10px] leading-relaxed text-[#5e6c77]">
                Incidents are up <span className="font-bold text-[#d9482b]">12%</span> against the six-week moving average, driven primarily by assault volume.
              </p>
              <div className="mt-5 flex items-start gap-3 rounded-[20px] bg-white/55 p-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#fbeae5] text-[#d9482b]"><ShieldAlert size={14} /></span>
                <div>
                  <p className="text-[10px] font-semibold text-[#293346]">Analyst attention recommended</p>
                  <p className="mt-1 text-[9px] leading-relaxed text-[#6d7782]">Review March category clustering alongside the latest W6 surge.</p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <motion.section
        variants={cardVariants}
        className="dashboard-surface lift-card rounded-[28px] p-5 sm:rounded-[32px] sm:p-6"
        aria-labelledby="composition-title"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a2]">Six-month composition</p>
            <h2 id="composition-title" className="mt-1 text-lg font-semibold tracking-[-0.035em] text-[#182033]">Category contribution</h2>
          </div>
          <p className="text-[9px] text-[#818a94]">Share of {formatNumber(totalIncidents)} registered incidents</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3 lg:gap-7">
          {categoryTotals.map((category, index) => {
            const share = Math.round((category.value / totalIncidents) * 100);
            return (
              <div key={category.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[10px] font-semibold text-[#3c4658]"><span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />{category.label}</span>
                  <span className="text-[10px] font-bold text-[#182033]">{share}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8ecef]">
                  <motion.div
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${share}%` }}
                    transition={{ delay: reduceMotion ? 0 : 0.62 + index * 0.12, duration: 0.9, ease: EASE_OUT }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <p className="mt-2 text-[9px] text-[#858e98]">{formatNumber(category.value)} recorded cases</p>
              </div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
