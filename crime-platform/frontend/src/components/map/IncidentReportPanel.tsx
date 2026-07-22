"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, MapPin, User, X } from "lucide-react";
import { incidentTypeColors, type CrimeIncident } from "@/lib/map-data";

const statusStyles: Record<CrimeIncident["status"], string> = {
  Open: "border-red-400/35 bg-red-500/20 text-red-100",
  "Under Investigation": "border-[#fd8d3c]/35 bg-[#fd8d3c]/15 text-[#fed976]",
  "Chargesheet Filed": "border-sky-400/35 bg-sky-500/20 text-sky-100",
  Closed: "border-emerald-400/35 bg-emerald-500/20 text-emerald-100",
};

const severityStyles: Record<CrimeIncident["severity"], string> = {
  High: "border-red-400/35 bg-red-500/20 text-red-100",
  Medium: "border-orange-400/35 bg-orange-500/20 text-orange-100",
  Low: "border-white/15 bg-white/10 text-white/65",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function kmBetween(first: CrimeIncident, second: CrimeIncident) {
  const earthRadiusKm = 6371;
  const latDelta = ((second.lat - first.lat) * Math.PI) / 180;
  const lngDelta = ((second.lng - first.lng) * Math.PI) / 180;
  const startLat = (first.lat * Math.PI) / 180;
  const endLat = (second.lat * Math.PI) / 180;
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function IncidentReportPanel({ incident, incidents, onClose }: { incident: CrimeIncident; incidents: CrimeIncident[]; onClose: () => void }) {
  const [exporting, setExporting] = useState(false);
  const color = incidentTypeColors[incident.type];
  const similarCases = useMemo(
    () =>
      incidents
        .filter((item) => item.id !== incident.id && item.type === incident.type && item.district === incident.district)
        .map((item) => ({ ...item, distance: kmBetween(incident, item) }))
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 2),
    [incident, incidents],
  );

  const exportPdf = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const rows = [
        "INCIDENT REPORT",
        incident.id,
        "",
        `Crime Type: ${incident.type}`,
        `Severity: ${incident.severity}`,
        `Status: ${incident.status}`,
        `IPC Section: ${incident.ipc_section}`,
        `Location: ${incident.location}, ${incident.district}`,
        `Date: ${formatDate(incident.date)}`,
        "",
        "ACCUSED",
        incident.accused,
        "",
        "VICTIM",
        incident.victim,
        "",
        "SIMILAR CASES NEARBY",
        ...(similarCases.length ? similarCases.map((item) => `${item.id} - ${item.type} - ${item.distance.toFixed(1)} km away`) : ["No matching nearby incidents"]),
      ];
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text(rows[0], 48, 52);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      rows.slice(1).forEach((row, index) => pdf.text(row, 48, 84 + index * 18));
      pdf.save(`${incident.id}-report.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <aside className="absolute inset-y-3 right-3 z-[1100] flex w-[min(24rem,calc(100%-1.5rem))] animate-[panel-slide_220ms_ease-out] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0f1117]/98 text-white shadow-2xl backdrop-blur-md sm:inset-y-5 sm:right-5" aria-label={`${incident.id} incident report`}>
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#fd8d3c]">Incident report</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{incident.id}</h2>
        </div>
        <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close incident report"><X size={16} /></button>
      </div>

      <div className="thin-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/45">Crime type</p>
            <p className="mt-1 text-sm font-semibold" style={{ color }}>{incident.type}</p>
          </div>
          <div className={`rounded-md border p-3 ${severityStyles[incident.severity]}`}>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] opacity-70">Severity</p>
            <p className="mt-1 text-sm font-semibold">{incident.severity}</p>
          </div>
          <div className={`rounded-md border p-3 ${statusStyles[incident.status]}`}>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] opacity-70">Status</p>
            <p className="mt-1 text-sm font-semibold leading-tight">{incident.status}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-white/72">
          <p className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-[#fd8d3c]" /> {incident.location}, {incident.district}</p>
          <p className="text-white/55">{formatDate(incident.date)} | {incident.ipc_section}</p>
        </div>

        <section className="border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Accused</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-white/10 text-[#fd8d3c]"><User size={16} /></span>
            <div>
              <p className="text-sm font-semibold">{incident.accused}</p>
              <button type="button" className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#fed976] hover:text-white">View Full Profile <ExternalLink size={12} /></button>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Victim</p>
          <p className="mt-3 flex items-center gap-3 text-sm font-semibold"><span className="flex size-9 items-center justify-center rounded-md bg-white/10 text-white/70"><User size={16} /></span>{incident.victim}</p>
        </section>

        <section className="border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Investigation status</p>
          <p className="mt-3 flex items-center gap-2 text-sm"><span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />{incident.status}</p>
        </section>

        <section className="border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Similar cases nearby</p>
          <div className="mt-3 space-y-2">
            {similarCases.length ? similarCases.map((item) => (
              <p key={item.id} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/68">{item.id} | {item.type} | {item.distance.toFixed(1)}km away</p>
            )) : <p className="text-xs text-white/45">No matching nearby incidents in this district.</p>}
          </div>
        </section>
      </div>

      <div className="border-t border-white/10 p-5">
        <button type="button" onClick={exportPdf} disabled={exporting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#fd8d3c] px-4 text-sm font-semibold text-[#1a0a05] transition hover:bg-[#fed976] disabled:cursor-wait disabled:opacity-70">
          <Download size={16} /> {exporting ? "Exporting..." : "Export Report as PDF"}
        </button>
      </div>
    </aside>
  );
}
