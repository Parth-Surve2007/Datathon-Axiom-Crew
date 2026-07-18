"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, MessageSquare, PieChart, Map, Network, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Intelligence', href: '/chat', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Geospatial', href: '/map', icon: Map },
  { name: 'Syndicates', href: '/network', icon: Network },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-20 hover:w-64 bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl z-50 flex flex-col transition-all duration-500 ease-in-out overflow-hidden group shadow-[0_0_40px_-10px_rgba(20,184,166,0.1)]">
      
      {/* Brand */}
      <div className="h-24 flex items-center px-6 whitespace-nowrap">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img src="/ksp-logo.png" alt="KSP" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <div className="ml-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 tracking-tighter">Kangavalu</h1>
          <span className="text-[11px] text-teal-300/80 font-mono font-light tracking-widest uppercase mt-0.5">Always Watching</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-3 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/5 border border-teal-500/20 rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={twMerge(
                clsx(
                  "relative flex items-center px-3 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap",
                  isActive ? "text-teal-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )
              )}>
                <div className="w-8 flex justify-center flex-shrink-0">
                  <item.icon size={22} className={isActive ? "drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]" : ""} />
                </div>
                <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-4 mt-auto">
        <Link href="/login" className="flex items-center px-3 py-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors whitespace-nowrap">
           <div className="w-8 flex justify-center flex-shrink-0">
             <LogOut size={20} />
           </div>
           <span className="ml-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">End Session</span>
        </Link>
      </div>
    </aside>
  );
}
