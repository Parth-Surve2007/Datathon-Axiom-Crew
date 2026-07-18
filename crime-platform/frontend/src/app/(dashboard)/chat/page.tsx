"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, FileText, Download, Terminal } from 'lucide-react';

export default function Chat() {
  const [messages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'KrimeAI Node Initialized. Ready for queries.',
      timestamp: '10:00:01'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Scan recent mobile thefts in Majestic sector over last 30 days.',
      timestamp: '10:02:15'
    },
    {
      id: 3,
      sender: 'bot',
      text: 'Processing... 24 cases identified. Extracting pattern data.',
      timestamp: '10:02:17',
      hasCard: true
    }
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#09090b]/80 backdrop-blur-2xl rounded-[40px] border border-white/10 overflow-hidden relative shadow-2xl">
      
      {/* Top Header */}
      <header className="p-6 border-b border-white/10 bg-white/5 absolute top-0 w-full z-10 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/30 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <Terminal className="text-teal-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Krime<span className="text-teal-400">AI</span> Terminal</h1>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              SECURE CONNECTION ESTABLISHED
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 border border-white/10">
          <Download size={16} /> Dump Log
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 pt-32 pb-24 space-y-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', damping: 25 }}
              className={`flex gap-4 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${msg.sender === 'user' ? 'bg-cyan-900/40 border-cyan-500/30' : 'bg-teal-900/40 border-teal-500/30'}`}>
                {msg.sender === 'user' ? <User size={18} className="text-cyan-400" /> : <Bot size={18} className="text-teal-400" />}
              </div>
              
              <div className="flex flex-col gap-2 max-w-xl">
                <div className={`p-5 rounded-3xl font-mono text-sm leading-relaxed border ${
                  msg.sender === 'user' 
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-50 rounded-tr-sm' 
                    : 'bg-teal-500/10 border-teal-500/20 text-teal-50 rounded-tl-sm'
                }`}>
                  <p>{msg.text}</p>
                </div>
                <span className={`text-[10px] font-mono text-slate-500 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>

                {msg.hasCard && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 bg-[#050505]/80 border border-teal-500/30 rounded-[32px] p-6 shadow-[0_0_30px_rgba(45,212,191,0.05)]"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/30"><FileText className="text-teal-400" size={20} /></div>
                      <h3 className="font-bold text-white tracking-wide">Query Result Matrix</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <p className="text-xs font-mono text-slate-400 uppercase">Records Found</p>
                        <p className="text-2xl font-bold text-teal-400 mt-1">24</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <p className="text-xs font-mono text-slate-400 uppercase">Confidence</p>
                        <p className="text-2xl font-bold text-cyan-400 mt-1">94%</p>
                      </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 rounded-xl text-sm font-bold tracking-widest transition-colors border border-teal-500/30 uppercase">
                      Visualize Map
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-[#09090b] to-transparent">
        <div className="relative flex items-center max-w-3xl mx-auto">
          <input 
            type="text" 
            placeholder="Enter command or query..." 
            className="w-full pl-6 pr-16 py-5 bg-black/50 backdrop-blur-xl border border-white/20 text-white rounded-[32px] focus:outline-none focus:border-teal-500 transition-colors font-mono text-sm"
          />
          <button className="absolute right-3 p-3 bg-teal-500/20 text-teal-400 rounded-2xl hover:bg-teal-500/40 border border-teal-500/30 transition-all shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
