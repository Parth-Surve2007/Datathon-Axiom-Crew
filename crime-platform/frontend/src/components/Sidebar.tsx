"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  FileStack,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessageSquareText,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

import kspLogo from "../../public/ksp-logo.png";

const navItems = [
  { name: "Overview", shortName: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Intelligence", shortName: "Intel", href: "/chat", icon: MessageSquareText },
  { name: "Analytics", shortName: "Data", href: "/analytics", icon: ChartNoAxesCombined },
  { name: "Reports", shortName: "Files", href: "/reports", icon: FileStack },
  { name: "Geospatial", shortName: "Map", href: "/map", icon: MapPinned },
  { name: "Syndicates", shortName: "Graph", href: "/network", icon: Share2 },
];

function NavLink({
  item,
  pathname,
  compact = false,
  navId = "primary",
}: {
  item: (typeof navItems)[number];
  pathname: string;
  compact?: boolean;
  navId?: string;
}) {
  const cleanPath = (pathname || "").replace(/^\/app/, "").replace(/\/$/, "") || "/";
  const cleanHref = item.href.replace(/\/$/, "") || "/";
  const active = cleanPath === cleanHref || (cleanHref !== "/" && cleanPath.startsWith(cleanHref + "/"));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={
        compact
          ? "relative flex min-w-[56px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium"
          : "relative flex min-h-11 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium"
      }
    >
      {active && (
        <motion.span
          layoutId={compact ? "mobile-active-nav" : `${navId}-active-nav`}
          className={
            compact
              ? "absolute inset-x-1 inset-y-1 rounded-2xl bg-[#182033] shadow-lg"
              : "absolute inset-0 rounded-full bg-white shadow-[0_6px_18px_rgba(24,32,51,.08)] ring-1 ring-black/[.04]"
          }
          transition={{ type: "spring", stiffness: 330, damping: 30 }}
        />
      )}
      <Icon
        size={compact ? 19 : 15}
        strokeWidth={active ? 2.35 : 1.8}
        className={`relative z-10 transition-colors ${active ? (compact ? "text-white" : "text-[#d9482b]") : "text-[#78808b]"}`}
      />
      <span className={`relative z-10 transition-colors ${active ? (compact ? "text-white" : "text-[#182033]") : "text-[#626a75]"}`}>
        {compact ? item.shortName : item.name}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data } = useLiveIntelligence();
  const headerRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchItems = useMemo(() => [
    ...(data?.investigations.slice(0, 3).map((item) => ({ label: `FIR ${item.id}`, meta: item.title, href: "/dashboard" })) ?? []),
    ...(data?.hotspots.slice(0, 2).map((item) => ({ label: item.label, meta: `${item.cases} cases · ${item.district}`, href: "/map" })) ?? []),
    ...(data?.network.nodes.filter((node) => node.kind === "Person").slice(0, 2).map((node) => ({ label: node.label, meta: node.subtitle, href: "/network" })) ?? []),
  ], [data]);
  const notifications = data?.investigations.slice(0, 2) ?? [];

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems.slice(0, 3);
    return searchItems.filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(normalized));
  }, [query, searchItems]);

  const closePanels = () => {
    setNoticeOpen(false);
    setSettingsOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    const closeAll = () => {
      setSearchOpen(false);
      setNoticeOpen(false);
      setSettingsOpen(false);
      setProfileOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAll();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ opacity: 0, y: -22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="topbar-shadow sticky top-0 z-50 border-b border-white/70 bg-[#e9edf0]/90 backdrop-blur-2xl"
      >
        <div className="mx-auto flex min-h-[76px] max-w-[1640px] items-center gap-4 px-4 sm:px-6 xl:px-8">
          <Link href="/dashboard" className="group flex shrink-0 items-center gap-2.5" aria-label="Kangavalu overview">
            <motion.span
              whileHover={{ rotate: -6, scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              className="flex size-10 items-center justify-center rounded-2xl bg-[#d9482b] shadow-[0_10px_24px_rgba(217,72,43,.22)]"
            >
              <Image src={kspLogo} alt="KSP Logo" width={32} height={28} className="h-7 w-8 object-contain" priority />
            </motion.span>
            <span className="hidden sm:block">
              <span className="block text-[15px] font-bold leading-none tracking-[-0.025em] text-[#182033]">Kangavalu</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8a929d]">Karnataka State Police</span>
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="ml-3 hidden items-center gap-0.5 rounded-full bg-[#dfe4e8]/85 p-1 xl:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} navId="top" />
            ))}
          </nav>

          <div className="relative ml-auto hidden min-w-0 flex-1 justify-end lg:flex">
            <div className="relative w-full max-w-[330px]">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#828a94]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => {
                  setSearchOpen(true);
                  closePanels();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Search FIR, person, vehicle…"
                aria-label="Search intelligence records"
                className="h-11 w-full rounded-full border border-white/80 bg-white/65 pl-11 pr-11 text-[13px] text-[#182033] shadow-sm outline-none transition-all placeholder:text-[#969da6] focus:w-full focus:border-[#d9482b]/25 focus:bg-white focus:shadow-[0_12px_32px_rgba(24,32,51,.1)]"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#d5dbe0] bg-[#f5f7f8] px-1.5 py-0.5 font-sans text-[9px] text-[#7a828c] 2xl:block">⌘ K</kbd>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 8, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 top-full overflow-hidden rounded-3xl border border-[#d9dfe4] bg-white p-2 shadow-[0_22px_60px_rgba(24,32,51,.18)]"
                  >
                    <div className="flex items-center justify-between px-3 pb-1 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#959ca5]">Quick access</p>
                      <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="rounded-full p-1 text-[#88909a] hover:bg-[#f0f2f4]">
                        <X size={14} />
                      </button>
                    </div>
                    {results.length ? (
                      results.map((result, index) => (
                        <motion.div key={result.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>
                          <Link href={result.href} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-[#f3f5f6]">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-[#fbeae5] text-[#d9482b]"><Search size={14} /></span>
                            <span className="min-w-0">
                              <span className="block truncate text-[12px] font-semibold text-[#283043]">{result.label}</span>
                              <span className="block truncate text-[10px] text-[#8a929c]">{result.meta}</span>
                            </span>
                          </Link>
                        </motion.div>
                      ))
                    ) : (
                      <p className="px-3 py-5 text-center text-xs text-[#858d97]">No matching intelligence record</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative flex shrink-0 items-center gap-2">
            <button
              onClick={() => {
                closePanels();
                setSearchOpen((value) => !value);
              }}
              aria-label="Open search"
              className="flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/60 text-[#5f6873] transition hover:-translate-y-0.5 hover:bg-white lg:hidden"
            >
              <Search size={17} />
            </button>
            <button
              onClick={() => {
                setSettingsOpen((value) => !value);
                setNoticeOpen(false);
                setProfileOpen(false);
                setSearchOpen(false);
              }}
              aria-label="Interface settings"
              aria-expanded={settingsOpen}
              aria-haspopup="dialog"
              aria-controls="settings-popover"
              className="hidden size-11 items-center justify-center rounded-full border border-white/80 bg-white/60 text-[#5f6873] transition hover:-translate-y-0.5 hover:bg-white sm:flex"
            >
              <Settings2 size={17} />
            </button>
            <button
              onClick={() => {
                setNoticeOpen((value) => !value);
                setSettingsOpen(false);
                setProfileOpen(false);
                setSearchOpen(false);
              }}
              aria-label={`Notifications, ${notifications.length} unread`}
              aria-expanded={noticeOpen}
              aria-haspopup="dialog"
              aria-controls="notice-popover"
              className="relative flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/60 text-[#5f6873] transition hover:-translate-y-0.5 hover:bg-white"
            >
              <Bell size={17} />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#d9482b] ring-2 ring-[#f4f6f7]" />
            </button>
            <button
              onClick={() => {
                setProfileOpen((value) => !value);
                setSettingsOpen(false);
                setNoticeOpen(false);
                setSearchOpen(false);
              }}
              aria-label="Open officer menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-controls="profile-popover"
              className="flex min-h-11 items-center gap-2 rounded-full border border-white/80 bg-white/75 p-1 pr-2 text-left shadow-sm transition hover:bg-white"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-[#182033] text-[11px] font-bold text-white">AR</span>
              <span className="hidden 2xl:block">
                <span className="block text-[11px] font-semibold leading-tight text-[#242d40]">A. Rao</span>
                <span className="block text-[9px] text-[#89919b]">Analyst</span>
              </span>
              <ChevronDown size={13} className="hidden text-[#8a929c] 2xl:block" />
            </button>

            <AnimatePresence>
              {noticeOpen && (
                <motion.div id="notice-popover" role="dialog" aria-label="Notifications" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 8, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }} className="absolute right-0 top-full w-[min(340px,calc(100vw-2rem))] rounded-3xl border border-[#d7dde2] bg-white p-3 shadow-[0_22px_60px_rgba(24,32,51,.18)]">
                  <div className="flex items-center justify-between px-2 pb-2 pt-1">
                    <h2 className="text-sm font-semibold text-[#182033]">Live notifications</h2>
                    <span className="rounded-full bg-[#fbeae5] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#d9482b]">{notifications.length} new</span>
                  </div>
                  {notifications.map((item, index) => (
                    <motion.button key={item.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="flex w-full gap-3 rounded-2xl p-3 text-left hover:bg-[#f4f6f7]">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${index === 0 ? "bg-[#d9482b]" : "bg-[#75a7d3]"}`} />
                      <span><span className="block text-xs font-semibold text-[#283043]">{item.title}</span><span className="mt-1 block text-[10px] text-[#858e98]">FIR {item.id} · {item.status}</span></span>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {settingsOpen && (
                <motion.div id="settings-popover" role="dialog" aria-label="Workspace settings" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 8, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }} className="absolute right-0 top-full w-72 rounded-3xl border border-[#d7dde2] bg-white p-4 shadow-[0_22px_60px_rgba(24,32,51,.18)]">
                  <h2 className="text-sm font-semibold text-[#182033]">Workspace settings</h2>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between rounded-2xl bg-[#f3f5f6] p-3"><span className="text-xs text-[#5f6873]">Motion system</span><span className="rounded-full bg-[#e5f1ef] px-2 py-1 text-[9px] font-bold uppercase text-[#287a71]">Enhanced</span></div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#f3f5f6] p-3"><span className="text-xs text-[#5f6873]">Interface</span><span className="text-[10px] font-semibold text-[#182033]">Light · Spacious</span></div>
                  </div>
                </motion.div>
              )}

              {profileOpen && (
                <motion.div id="profile-popover" role="menu" aria-label="Officer menu" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 8, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }} className="absolute right-0 top-full w-64 rounded-3xl border border-[#d7dde2] bg-white p-3 shadow-[0_22px_60px_rgba(24,32,51,.18)]">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <span className="flex size-10 items-center justify-center rounded-full bg-[#182033] text-xs font-bold text-white">AR</span>
                    <span><span className="block text-xs font-semibold text-[#182033]">Ananya Rao</span><span className="block text-[10px] text-[#8b939d]">Crime Intelligence Analyst</span></span>
                  </div>
                  <div className="my-2 h-px bg-[#e6eaed]" />
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium text-[#56606c] hover:bg-[#f3f5f6]"><ShieldCheck size={15} /> Officer profile</Link>
                  <Link href="/login" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium text-[#d9482b] hover:bg-[#fbeae5]"><LogOut size={15} /> End session</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="thin-scrollbar mx-auto hidden max-w-[1640px] items-center gap-1 overflow-x-auto px-4 pb-3 md:flex xl:hidden">
          {navItems.map((item) => <NavLink key={item.href} item={item} pathname={pathname} navId="tablet" />)}
        </nav>

        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/60 px-4 lg:hidden">
              <div className="mx-auto flex max-w-[1640px] gap-2 py-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c848e]" />
                  <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FIR, person, vehicle…" aria-label="Search intelligence records" className="h-12 w-full rounded-full border border-white bg-white pl-11 pr-4 text-sm outline-none focus:border-[#d9482b]/30" />
                </div>
                <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="flex size-12 items-center justify-center rounded-full bg-[#182033] text-white"><X size={18} /></button>
              </div>
              {query && (
                <div className="mx-auto mb-3 max-w-[1640px] rounded-3xl bg-white p-2 shadow-lg">
                  {results.slice(0, 3).map((result) => <Link key={result.label} href={result.href} onClick={() => setSearchOpen(false)} className="block rounded-2xl px-4 py-3 hover:bg-[#f3f5f6]"><span className="block text-xs font-semibold">{result.label}</span><span className="text-[10px] text-[#858d97]">{result.meta}</span></Link>)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-50 flex items-stretch rounded-[24px] border border-white/10 bg-[#182033]/95 p-1.5 shadow-[0_18px_50px_rgba(24,32,51,.35)] backdrop-blur-xl md:hidden">
        {navItems.map((item) => <NavLink compact key={item.href} item={item} pathname={pathname} navId="mobile" />)}
      </nav>
    </>
  );
}
