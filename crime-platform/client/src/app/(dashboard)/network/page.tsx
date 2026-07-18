"use client";

import { motion } from 'framer-motion';
import { Network as NetworkIcon, Search, ZoomIn, Download } from 'lucide-react';

export default function NetworkGraph() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tighter">
            Syndicate Nexus
          </h1>
          <p className="text-teal-500 font-mono mt-3 text-sm uppercase tracking-widest flex items-center gap-2">
            <NetworkIcon size={14} />
            Relational Entity Mapping
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Query entity ID..." 
              className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-teal-500 w-72 text-white font-mono placeholder-slate-600 transition-colors"
            />
            <Search size={16} className="absolute left-4 top-3.5 text-slate-500" />
          </div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 bg-[#09090b]/80 backdrop-blur-xl rounded-[40px] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl"
      >
        {/* Toolbar */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <button className="p-2 text-slate-400 hover:text-teal-400 hover:bg-white/5 rounded-xl transition-colors"><ZoomIn size={20} /></button>
          <button className="p-2 text-slate-400 hover:text-teal-400 hover:bg-white/5 rounded-xl transition-colors"><NetworkIcon size={20} /></button>
          <button className="p-2 text-slate-400 hover:text-teal-400 hover:bg-white/5 rounded-xl transition-colors"><Download size={20} /></button>
        </div>

        {/* Abstract animated nodes */}
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} x1="25%" y1="35%" x2="50%" y2="50%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="4 4" />
            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} x1="50%" y1="50%" x2="70%" y2="40%" stroke="#06b6d4" strokeWidth="2" />
            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} x1="70%" y1="40%" x2="65%" y2="75%" stroke="#0891b2" strokeWidth="1" />
            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.6 }} x1="50%" y1="50%" x2="35%" y2="65%" stroke="#2dd4bf" strokeWidth="3" />
            
            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }} cx="25%" cy="35%" r="10" fill="#0f766e" />
            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.7 }} cx="50%" cy="50%" r="16" fill="#2dd4bf" />
            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.9 }} cx="70%" cy="40%" r="12" fill="#06b6d4" />
            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.1 }} cx="65%" cy="75%" r="10" fill="#0891b2" />
            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.3 }} cx="35%" cy="65%" r="8" fill="#14b8a6" />
          </svg>
        </div>
        
        <div className="text-center z-10 bg-black/80 backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl border border-cyan-500/20 max-w-lg">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-cyan-500/30">
            <NetworkIcon size={32} className="text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">Graph Core Suspended</h2>
          <p className="text-slate-400 font-light leading-relaxed mb-8">
            Awaiting Cytoscape.js or similar engine integration to map the relational database output into interactive nodes and edges.
          </p>
          <button className="w-full py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold tracking-widest text-sm rounded-2xl transition-all uppercase">
            Connect Graph DB
          </button>
        </div>
      </motion.div>
    </div>
  );
}
