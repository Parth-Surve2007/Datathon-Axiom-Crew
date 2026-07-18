"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, FileText, Users, TrendingUp, Activity, FileSearch, Network } from 'lucide-react';

const stats = [
  { id: 1, name: 'Active Cases', value: '1,248', icon: FileText, gradient: 'from-teal-400 to-cyan-500' },
  { id: 2, name: 'High Priority', value: '84', icon: AlertTriangle, gradient: 'from-rose-400 to-orange-500' },
  { id: 3, name: 'POIs Tracked', value: '4,321', icon: Users, gradient: 'from-cyan-400 to-blue-500' },
  { id: 4, name: 'Clearance Rate', value: '68%', icon: TrendingUp, gradient: 'from-emerald-400 to-teal-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <header className="mb-12">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tighter">
          Tactical Overview
        </h1>
        <p className="text-teal-500 font-mono mt-3 text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
          Live Intelligence Feed
        </p>
      </header>

      {/* Radical Floating Cards */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {stats.map((stat) => (
          <motion.div 
            key={stat.id}
            variants={itemVariants}
            className="group relative rounded-3xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-teal-500/50 transition-all duration-500 overflow-hidden"
          >
            {/* Animated Glow */}
            <div className={`absolute -inset-2 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700`} />
            
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{stat.name}</p>
                <p className={`text-4xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient} drop-shadow-sm`}>
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-white transition-colors shadow-inner">
                <stat.icon size={22} />
              </div>
            </div>
            
            {/* Geometric Accent */}
            <svg className="absolute bottom-0 right-0 w-24 h-24 opacity-10 text-white transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-12">
        {/* Irregular Activity Glass Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="xl:col-span-2 bg-[#09090b]/40 backdrop-blur-2xl rounded-[40px] border border-white/5 p-8 relative overflow-hidden"
        >
          {/* Subtle mesh background inside panel */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent opacity-50" />
          
          <div className="relative z-10 flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="text-teal-400" />
              Incident Stream
            </h2>
          </div>
          
          <div className="relative z-10 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-6 p-4 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/10 group-hover:border-teal-500/50 transition-colors">
                  <span className="text-xs font-mono text-teal-400">0{i}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                     <p className="text-sm font-semibold text-slate-200">FIR #{2023000 + i}</p>
                     <p className="text-xs font-mono text-slate-500">T-{i}h</p>
                  </div>
                  <p className="text-sm text-slate-400">Unauthorized electronic access reported in Indiranagar sector.</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insight Node */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="relative rounded-[40px] shadow-2xl overflow-hidden p-1 border border-teal-500/30"
        >
          {/* Glowing Border Wrap */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/40 via-cyan-600/10 to-slate-900 z-0" />
          
          <div className="relative z-10 bg-[#09090b]/90 backdrop-blur-3xl h-full rounded-[36px] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white tracking-wide">Krime Engine</h2>
                <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-xs font-mono text-teal-300">
                  ANALYZING
                </div>
              </div>

              <div className="space-y-6">
                <div className="group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <FileSearch size={18} className="text-cyan-400" />
                    <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Anomaly</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    3 recent vehicle thefts share modus operandi involving electronic relay attacks. Probability of syndicate involvement: <span className="text-white font-bold">87%</span>.
                  </p>
                </div>
                
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6" />

                <div className="group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Network size={18} className="text-teal-400" />
                    <p className="text-sm font-bold text-teal-400 uppercase tracking-widest">Nexus Detected</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    Suspect 'Rahul K.' (FIR #2023045) exhibits communication patterns matching the XYZ ring graph signature.
                  </p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-black font-bold tracking-widest text-sm hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all uppercase">
              Expand Intelligence
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
