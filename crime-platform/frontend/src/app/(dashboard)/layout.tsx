"use client";

import Sidebar from '@/components/Sidebar';
import Watermark from '@/components/Watermark';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-200 overflow-hidden relative selection:bg-teal-500/30">
      
      {/* Immersive Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-800/10 blur-[150px]" />
      </div>

      {/* Faint KSP Emblem Watermark */}
      <Watermark />

      <Sidebar />
      
      <div className="flex-1 ml-28 flex flex-col min-h-screen relative z-10 transition-all duration-500">
        
        {/* Minimalist Top Nav / Status Bar */}
        <header className="h-16 flex items-center justify-end px-8 mt-4 mr-4">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
             <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)]" />
             <span className="text-xs font-mono text-teal-200 uppercase tracking-widest">KSP Node Active</span>
          </div>
        </header>

        <main className="flex-1 p-8 pt-4 pb-20 max-w-[1600px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
