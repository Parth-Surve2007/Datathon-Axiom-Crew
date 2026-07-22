"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Activity, Crosshair, Flame, MapPin, Radar } from "lucide-react";
import { catalystBackendBase } from "@/lib/intelligence";
import { fallbackCrimeIncidents, fallbackDistrictCrimeData, type CrimeIncident, type DistrictCrimeData, type IncidentType } from "@/lib/map-data";
import { IncidentFilterBar } from "@/components/map/IncidentFilterBar";

const MapView = dynamic(() => import("@/components/map/MapView").then((module) => module.MapView), { ssr: false, loading: () => <div className="h-[calc(100dvh-12rem)] min-h-[580px] animate-pulse rounded-lg bg-[#101119]" /> });

export default function CrimeMapPage() {
  const [districts, setDistricts] = useState<DistrictCrimeData[]>(fallbackDistrictCrimeData);
  const [incidents, setIncidents] = useState<CrimeIncident[]>(fallbackCrimeIncidents);
  const [heatmap, setHeatmap] = useState(false);
  const [forecast, setForecast] = useState(false);
  const [showIncidents, setShowIncidents] = useState(false);
  const [activeTypes, setActiveTypes] = useState<IncidentType[]>([]);
  const [openOnly, setOpenOnly] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${catalystBackendBase}/map`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Map data unavailable")))
      .then((payload: DistrictCrimeData[]) => { if (Array.isArray(payload) && payload.length) setDistricts(payload); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${catalystBackendBase}/incidents`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Incident data unavailable")))
      .then((payload: { incidents?: CrimeIncident[] }) => { if (Array.isArray(payload.incidents) && payload.incidents.length) setIncidents(payload.incidents); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const filteredIncidents = useMemo(
    () =>
      incidents.filter((incident) => {
        const typeMatch = activeTypes.length === 0 || activeTypes.includes(incident.type);
        const statusMatch = !openOnly || incident.status === "Open";
        return typeMatch && statusMatch;
      }),
    [activeTypes, incidents, openOnly],
  );

  const toggleType = (type: IncidentType) => {
    setActiveTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  };

  const totalCrime = districts.reduce((total, district) => total + district.crime_count, 0);
  return (
    <div className="-mx-4 min-h-[calc(100dvh-5rem)] bg-[#0a0a0f] px-4 py-5 text-white sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8">
      <header className="mx-auto mb-5 flex max-w-[1580px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#fd8d3c]"><Radar size={14} /> Karnataka crime intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Geospatial command map</h1>
          <p className="mt-2 text-sm text-white/55">District-level crime density, predictive risk signals, and incident concentration.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setHeatmap((value) => !value)} aria-pressed={heatmap} className={`flex min-h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition ${heatmap ? "border-[#fd8d3c] bg-[#fd8d3c] text-[#1a0a05]" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"}`}><Flame size={15} /> Heatmap</button>
          <button type="button" onClick={() => setForecast((value) => !value)} aria-pressed={forecast} className={`flex min-h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition ${forecast ? "border-red-400 bg-red-500/20 text-red-100" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"}`}><Activity size={15} /> Forecast</button>
          <button type="button" onClick={() => setShowIncidents((value) => !value)} aria-pressed={showIncidents} className={`flex min-h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition ${showIncidents ? "border-[#fed976] bg-[#fed976] text-[#1a0a05]" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"}`}><MapPin size={15} /> Incidents</button>
        </div>
      </header>
      <section className="mx-auto mb-4 grid max-w-[1580px] grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-[#101119] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Total reports</p><p className="mt-1 text-2xl font-semibold text-[#fed976]">{totalCrime.toLocaleString()}</p></div>
        <div className="rounded-md border border-white/10 bg-[#101119] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Districts monitored</p><p className="mt-1 text-2xl font-semibold">{districts.length}</p></div>
        <div className="col-span-2 rounded-md border border-white/10 bg-[#101119] p-3 sm:col-span-1"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45"><Crosshair size={15} className="text-[#fd8d3c]" /> Active incidents</p><p className="mt-1 text-2xl font-semibold">{filteredIncidents.length}</p></div>
      </section>
      {showIncidents && (
        <IncidentFilterBar
          activeTypes={activeTypes}
          openOnly={openOnly}
          onToggleType={toggleType}
          onToggleOpenOnly={() => setOpenOnly((value) => !value)}
          onClear={() => { setActiveTypes([]); setOpenOnly(false); }}
        />
      )}
      <main className="mx-auto max-w-[1580px]"><MapView districts={districts} heatmap={heatmap} forecast={forecast} showIncidents={showIncidents} incidents={filteredIncidents} reportIncidents={incidents} /></main>
    </div>
  );
}
