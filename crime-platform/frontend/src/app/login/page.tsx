"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import Watermark from '@/components/Watermark';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-teal-500/30">
      {/* KSP Emblem Watermark */}
      <Watermark />
      {/* Dark Tactical Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-teal-900/20 blur-[150px]" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
          className="absolute top-[30%] -right-[20%] w-[70%] h-[90%] rounded-full bg-cyan-900/10 blur-[150px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] bg-[#09090b]/60 backdrop-blur-3xl rounded-[40px] shadow-[0_0_50px_rgba(20,184,166,0.05)] border border-white/10 p-12 relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-28 h-28 flex items-center justify-center mx-auto mb-6 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] relative">
            <img src="/ksp-logo.png" alt="KSP Logo" className="w-full h-full object-contain relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Kangavalu</h1>
          <p className="text-teal-300 font-mono font-light text-sm tracking-widest uppercase mb-6">Always Watching</p>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">KSP Authorized Access Only</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-3 pl-2">Secure Identifier</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
              </div>
              <input
                type="email"
                className="block w-full pl-14 pr-6 py-5 border border-white/10 rounded-3xl bg-black/40 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                placeholder="admin@gmail.com"
                defaultValue="admin@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-3 pl-2">Access Key</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
              </div>
              <input
                type="password"
                className="block w-full pl-14 pr-6 py-5 border border-white/10 rounded-3xl bg-black/40 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                placeholder="admin"
                defaultValue="admin"
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
            <Link href="/dashboard" className="w-full flex items-center justify-center py-5 px-6 rounded-3xl shadow-lg text-sm font-bold text-black bg-gradient-to-r from-teal-400 to-cyan-500 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all uppercase tracking-widest">
              Initialize Uplink
            </Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
