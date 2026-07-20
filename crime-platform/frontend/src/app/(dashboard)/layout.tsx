"use client";

import Sidebar from "@/components/Sidebar";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="app-shell selection:bg-[#d9482b]/20">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="ambient-orb absolute -left-32 top-20 size-[28rem] rounded-full bg-white/55 blur-[100px]" />
        <div className="ambient-orb-reverse absolute -right-40 bottom-[-12rem] size-[36rem] rounded-full bg-[#9dbbd3]/25 blur-[110px]" />
      </div>
      <Sidebar />
      <main className="relative z-10 mx-auto w-full max-w-[1640px] px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-7 xl:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -7, scale: 1.004 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
