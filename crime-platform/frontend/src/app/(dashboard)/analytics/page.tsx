"use client";

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Crosshair } from 'lucide-react';

const data = [
  { name: 'Jan', thefts: 400, assault: 240, fraud: 150 },
  { name: 'Feb', thefts: 300, assault: 139, fraud: 220 },
  { name: 'Mar', thefts: 200, assault: 980, fraud: 229 },
  { name: 'Apr', thefts: 278, assault: 390, fraud: 200 },
  { name: 'May', thefts: 189, assault: 480, fraud: 218 },
  { name: 'Jun', thefts: 239, assault: 380, fraud: 250 },
];

const trendData = [
  { name: 'W1', incidents: 120 },
  { name: 'W2', incidents: 132 },
  { name: 'W3', incidents: 101 },
  { name: 'W4', incidents: 134 },
  { name: 'W5', incidents: 90 },
  { name: 'W6', incidents: 190 },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tighter">
            Data Telemetry
          </h1>
          <p className="text-teal-500 font-mono mt-3 text-sm uppercase tracking-widest flex items-center gap-2">
            <Crosshair size={14} />
            Statistical Crime Analysis
          </p>
        </div>
        <button className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold tracking-widest uppercase text-xs transition-colors flex items-center gap-2 border border-white/10 shadow-[0_0_15px_rgba(45,212,191,0.1)] hover:border-teal-500/30">
          <Download size={16} /> Export Data
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-[#09090b]/60 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h2 className="text-xl font-bold text-white tracking-wide">Category Distribution (YTD)</h2>
            <select className="bg-black/50 border border-white/10 text-slate-300 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:border-teal-500 transition-colors">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid rgba(45,212,191,0.3)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', padding: '16px', color: '#fff' }}
                />
                <Bar dataKey="thefts" name="Thefts" stackId="a" fill="#2dd4bf" radius={[0, 0, 4, 4]} barSize={24} />
                <Bar dataKey="assault" name="Assault" stackId="a" fill="#0891b2" />
                <Bar dataKey="fraud" name="Fraud" stackId="a" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-b from-teal-900/40 to-[#09090b]/80 backdrop-blur-3xl p-8 rounded-[40px] border border-teal-500/20 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full blur-[80px] opacity-10" />
          
          <h2 className="text-xl font-bold mb-2 tracking-wide">Volume Trend</h2>
          <p className="text-xs font-mono text-teal-400 mb-8 uppercase tracking-widest">Weekly incidents</p>
          
          <div className="h-[200px] w-full -ml-4 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 p-5 bg-black/40 rounded-3xl border border-white/5 relative z-10">
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mb-2">Automated Analysis</p>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Incidents up <span className="text-teal-400 font-bold">12%</span> against 6-week moving average. High variance detected in W6.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
