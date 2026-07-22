"use client";

import { incidentTypeColors, type IncidentType } from "@/lib/map-data";

const filterTypes: IncidentType[] = ["Theft", "Assault", "Robbery", "Fraud", "Murder"];

export function IncidentFilterBar({
  activeTypes,
  openOnly,
  onToggleType,
  onToggleOpenOnly,
  onClear,
}: {
  activeTypes: IncidentType[];
  openOnly: boolean;
  onToggleType: (type: IncidentType) => void;
  onToggleOpenOnly: () => void;
  onClear: () => void;
}) {
  const allActive = activeTypes.length === 0 && !openOnly;

  return (
    <section className="mx-auto mb-4 max-w-[1580px] rounded-md border border-white/10 bg-[#101119] p-2.5 shadow-xl">
      <div className="thin-scrollbar flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={onClear}
          aria-pressed={allActive}
          className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition ${allActive ? "border-[#fd8d3c] bg-[#fd8d3c]/15 text-white" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
        >
          All
        </button>
        {filterTypes.map((type) => {
          const active = activeTypes.includes(type);
          const color = incidentTypeColors[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleType(type)}
              aria-pressed={active}
              className="min-h-9 shrink-0 rounded-full border bg-white/5 px-3 text-xs font-semibold text-white/70 transition hover:bg-white/10"
              style={{ borderColor: active ? color : "rgba(255,255,255,0.1)", color: active ? "#fff" : undefined, boxShadow: active ? `0 0 0 1px ${color}55 inset` : undefined }}
            >
              {type}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggleOpenOnly}
          aria-pressed={openOnly}
          className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition ${openOnly ? "border-red-400 bg-red-500/15 text-red-100" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
        >
          Open Only
        </button>
      </div>
    </section>
  );
}
