"use client";

import { motion } from 'framer-motion';
import { MapPin, Navigation, Filter } from 'lucide-react';

export default function CrimeMap() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tighter">
            Geospatial Uplink
          </h1>
          <p className="text-cyan-500 font-mono mt-3 text-sm uppercase tracking-widest flex items-center gap-2">
            <Navigation size={14} />
            Hotspot & Temporal Mapping
          </p>
        </div>
        <button className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold tracking-widest uppercase text-xs transition-colors flex items-center gap-2 border border-white/10">
          <Filter size={16} /> Parameters
        </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-[#09090b]/80 backdrop-blur-xl rounded-[40px] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl"
      >
        {/* Placeholder Map Background Effect */}
        <div className="absolute inset-0 opacity-30 grayscale contrast-150">
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/77.5946,12.9716,12,0/1200x800?access_token=YOUR_TOKEN')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-teal-900/40 mix-blend-color" />
        </div>
        
        {/* Animated Map Pins */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 z-10"
        >
          <div className="relative">
            <MapPin size={32} className="text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-teal-500 rounded-full blur-md opacity-40 animate-ping" />
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/2 right-1/3 z-10"
        >
          <MapPin size={32} className="text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
        </motion.div>
        
        <div className="text-center z-20 bg-black/60 backdrop-blur-3xl p-10 rounded-[40px] border border-teal-500/20 max-w-lg shadow-[0_0_50px_rgba(45,212,191,0.1)]">
          <div className="w-20 h-20 bg-teal-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-teal-500/30">
            <Navigation size={32} className="text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">GIS Subsystem Offline</h2>
          <p className="text-slate-400 font-light leading-relaxed mb-8">
            The mapping engine is standing by for Leaflet or Mapbox GL JS integration to render live hotspot data.
          </p>
          <button className="w-full py-4 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold tracking-widest text-sm rounded-2xl transition-all uppercase">
            Initialize Renderer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
