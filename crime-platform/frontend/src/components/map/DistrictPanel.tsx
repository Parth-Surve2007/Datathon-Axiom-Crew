"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";
import type { DistrictCrimeData } from "@/lib/map-data";

const colors = ["#fd8d3c", "#f06b3c", "#c9342f", "#f4bd57"];

export function DistrictPanel({ district, onClose }: { district: DistrictCrimeData; onClose: () => void }) {
  const chartData = Object.entries(district.crime_breakdown).map(([name, value]) => ({ name, value }));

  return (
    <aside className="absolute inset-y-3 right-3 z-[1000] flex w-[min(23rem,calc(100%-1.5rem))] flex-col rounded-lg border border-white/10 bg-[#101119]/95 p-5 text-white shadow-2xl backdrop-blur-md sm:inset-y-5 sm:right-5" aria-label={`${district.district_name} district details`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#fd8d3c]">District intelligence</p>
          <h2 className="mt-1 text-xl font-semibold">{district.district_name}</h2>
        </div>
        <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close district panel"><X size={16} /></button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-white/10 bg-white/5 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Crime reports</p><p className="mt-1 text-2xl font-semibold">{district.crime_count}</p></div>
        <div className="rounded-md border border-white/10 bg-white/5 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Top category</p><p className="mt-1 text-base font-semibold text-[#fed976]">{district.top_crime_type}</p></div>
      </div>

      <section className="mt-6 min-h-0 flex-1" aria-labelledby="breakdown-heading">
        <h3 id="breakdown-heading" className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Crime breakdown</h3>
        <div className="mt-3 h-56 rounded-md border border-white/10 bg-[#0a0a0f] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={58} tick={{ fill: "#aeb0ba", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,.05)" }} contentStyle={{ background: "#171821", border: "1px solid rgba(255,255,255,.15)", borderRadius: 6, color: "#fff", fontSize: 12 }} labelStyle={{ color: "#aeb0ba" }} />
              <Bar dataKey="value" radius={[3, 3, 3, 3]}>
                {chartData.map((item, index) => <Cell key={item.name} fill={colors[index]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/55">Click another district to update this operational profile.</p>
    </aside>
  );
}
