"use client";

const scale = [
  { label: "Low", color: "#ffffd4" },
  { label: "Moderate", color: "#fed976" },
  { label: "Elevated", color: "#fd8d3c" },
  { label: "High", color: "#800026" },
];

export function MapLegend() {
  return (
    <div className="pointer-events-auto rounded-lg border border-white/15 bg-[#101119]/95 px-3 py-2.5 text-white shadow-2xl backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Crime count</p>
      <div className="mt-2 flex items-center gap-1">
        {scale.map((item) => <span key={item.label} className="h-2.5 w-8 first:rounded-l last:rounded-r" style={{ backgroundColor: item.color }} />)}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-white/55"><span>Low</span><span>High</span></div>
    </div>
  );
}
