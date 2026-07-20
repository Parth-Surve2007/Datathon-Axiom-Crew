"use client";

import { DatabaseZap, LoaderCircle, RefreshCw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function LiveDataState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  const reduceMotion = useReducedMotion();
  if (!loading && !error) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-surface flex min-h-[240px] flex-col items-center justify-center rounded-[28px] p-8 text-center">
      {loading ? <LoaderCircle className={reduceMotion ? "text-[#d9482b]" : "animate-spin text-[#d9482b]"} size={28} /> : <DatabaseZap className="text-[#d9482b]" size={30} />}
      <h2 className="mt-4 text-lg font-semibold text-[#182033]">{loading ? "Reading Catalyst Data Store" : "Catalyst is not reachable"}</h2>
      <p className="mt-2 max-w-lg text-xs leading-5 text-[#737b86]">{loading ? "Building the live intelligence view from your current FIR records." : error}</p>
      {error && <button type="button" onClick={onRetry} className="mt-5 flex items-center gap-2 rounded-full bg-[#182033] px-4 py-2 text-xs font-semibold text-white"><RefreshCw size={14} /> Retry</button>}
    </motion.div>
  );
}

