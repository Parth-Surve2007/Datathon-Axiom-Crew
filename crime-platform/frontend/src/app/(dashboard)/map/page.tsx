"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Activity, ChevronRight, Crosshair, Flame, MapPin, Radio, RotateCcw, ShieldCheck, Timer, TrendingUp } from "lucide-react";
import { catalystBackendBase } from "@/lib/intelligence";
import { fallbackCrimeIncidents, fallbackDistrictCrimeData, type CrimeIncident, type DistrictCrimeData, type IncidentType } from "@/lib/map-data";
import { IncidentFilterBar } from "@/components/map/IncidentFilterBar";

const MapView = dynamic(() => import("@/components/map/MapView").then((module) => module.MapView), { ssr: false, loading: () => <div className="h-[470px] animate-pulse rounded-[20px] bg-[#101119]" /> });

const timeWindows = ["24h", "7d", "30d"] as const;

export default function CrimeMapPage() {
  const [districts, setDistricts] = useState<DistrictCrimeData[]>(fallbackDistrictCrimeData);
  const [incidents, setIncidents] = useState<CrimeIncident[]>(fallbackCrimeIncidents);
  const [heatmap, setHeatmap] = useState(false);
  const [forecast, setForecast] = useState(false);
  const [showIncidents, setShowIncidents] = useState(false);
  const [activeTypes, setActiveTypes] = useState<IncidentType[]>([]);
  const [openOnly, setOpenOnly] = useState(false);
  const [timeWindow, setTimeWindow] = useState<(typeof timeWindows)[number]>("7d");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictCrimeData | null>(fallbackDistrictCrimeData[0]);

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

  useEffect(() => {
    if (!selectedDistrict && districts.length) setSelectedDistrict(districts[0]);
  }, [districts, selectedDistrict]);

  const totalCrime = districts.reduce((total, district) => total + district.crime_count, 0);
  const rankedDistricts = [...districts].sort((first, second) => second.crime_count - first.crime_count).slice(0, 4);
  const districtAverage = districts.length ? totalCrime / districts.length : 0;
  const baselineDelta = selectedDistrict && districtAverage
    ? Math.round(((selectedDistrict.crime_count - districtAverage) / districtAverage) * 100)
    : 0;
  const filteredSelectedIncidents = filteredIncidents.filter((incident) => incident.district === selectedDistrict?.district_name);
  const windowMultiplier = timeWindow === "24h" ? 0.16 : timeWindow === "30d" ? 3.25 : 1;
  const areaWindowReports = selectedDistrict ? Math.max(filteredSelectedIncidents.length, Math.round(selectedDistrict.crime_count * windowMultiplier)) : 0;
  const openAreaCases = filteredSelectedIncidents.filter((incident) => incident.status === "Open" || incident.status === "Under Investigation").length;
  const priorityAreaIncidents = filteredSelectedIncidents.filter((incident) => incident.severity === "High").length;
  const responseMinutes = selectedDistrict
    ? Math.min(22, Math.max(6, Math.round(6 + (selectedDistrict.crime_count / Math.max(districtAverage, 1)) * 2 + openAreaCases * 0.9 + priorityAreaIncidents * 1.4)))
    : 0;
  const selectedLeadingTypeCount = selectedDistrict
    ? selectedDistrict.crime_breakdown[selectedDistrict.top_crime_type.toLowerCase() as keyof typeof selectedDistrict.crime_breakdown] ?? 0
    : 0;
  const statewideOpenCases = incidents.filter((incident) => incident.status === "Open" || incident.status === "Under Investigation").length;
  const statewidePriorityIncidents = incidents.filter((incident) => incident.severity === "High").length;
  const resetView = () => {
    setTimeWindow("7d");
    setHeatmap(false);
    setForecast(false);
    setShowIncidents(false);
    setActiveTypes([]);
    setOpenOnly(false);
    setSelectedDistrict(districts[0] ?? null);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] text-[#172033]">
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2d8178]"><Radio size={14} /> Live command intelligence</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Geospatial intelligence</h1>
          <p className="mt-1.5 text-sm text-[#738091]">Monitor incident density, patrol coverage, and emerging risk across Karnataka.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-[#dce2e8] bg-white p-1 shadow-sm">
            {timeWindows.map((option) => (
              <button key={option} type="button" onClick={() => setTimeWindow(option)} className={`min-h-9 rounded-lg px-3 text-xs font-medium transition ${timeWindow === option ? "bg-[#172033] text-white shadow-sm" : "text-[#738091] hover:bg-[#f1f4f6]"}`}>{option}</button>
            ))}
          </div>
          <button type="button" onClick={resetView} className="flex min-h-11 items-center gap-2 rounded-xl border border-[#dce2e8] bg-white px-4 text-xs font-semibold text-[#445064] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><RotateCcw size={15} /> Reset view</button>
        </div>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: `${timeWindow} area reports`, value: areaWindowReports.toLocaleString(), icon: Crosshair, tone: "text-[#d9482b] bg-[#fff0ec]" },
          { label: "Open live cases", value: openAreaCases, icon: Radio, tone: "text-[#172033] bg-[#f1f3f5]" },
          { label: "Priority incidents", value: priorityAreaIncidents, icon: ShieldCheck, tone: "text-[#2d8178] bg-[#eaf5f3]" },
          { label: "Response ETA", value: responseMinutes ? `${responseMinutes}m` : "--", icon: Timer, tone: "text-[#70a5ca] bg-[#edf5fa]" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="flex min-h-[96px] items-start justify-between rounded-[20px] border border-white/90 bg-white/90 p-4 shadow-[0_16px_36px_rgba(33,48,67,0.08)] backdrop-blur">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7b8796]">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p></div>
            <span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}><Icon size={16} /></span>
          </article>
        ))}
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

      <main className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="min-w-0 rounded-[26px] border border-white/90 bg-white/90 p-4 shadow-[0_22px_55px_rgba(33,48,67,0.1)] backdrop-blur sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-[#2d8178]" /> Karnataka command region</p>
              <p className="mt-1 text-[10px] text-[#7b8796]">Live operational view · {districts.length} monitored districts · {timeWindow} window</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setHeatmap((value) => !value)} aria-pressed={heatmap} className={`flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${heatmap ? "border-[#d9482b] bg-[#fff0ec] text-[#d9482b]" : "border-[#dce2e8] bg-white text-[#667385] hover:bg-[#f5f7f8]"}`}><Flame size={14} /> Heatmap</button>
              <button type="button" onClick={() => setForecast((value) => !value)} aria-pressed={forecast} className={`flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${forecast ? "border-[#172033] bg-[#172033] text-white" : "border-[#dce2e8] bg-white text-[#667385] hover:bg-[#f5f7f8]"}`}><Activity size={14} /> Forecast</button>
              <button type="button" onClick={() => setShowIncidents((value) => !value)} aria-pressed={showIncidents} className={`flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${showIncidents ? "border-[#2d8178] bg-[#eaf5f3] text-[#2d8178]" : "border-[#dce2e8] bg-white text-[#667385] hover:bg-[#f5f7f8]"}`}><MapPin size={14} /> Incidents</button>
            </div>
          </div>
          <MapView
            districts={districts}
            heatmap={heatmap}
            forecast={forecast}
            showIncidents={showIncidents}
            incidents={filteredIncidents}
            reportIncidents={incidents}
            selectedDistrict={selectedDistrict}
            onDistrictSelect={setSelectedDistrict}
            className="!h-[470px] !min-h-0 !rounded-[20px]"
          />
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-[26px] border border-white/90 bg-white/90 p-5 shadow-[0_22px_55px_rgba(33,48,67,0.1)] backdrop-blur" aria-live="polite">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#7b8796]">Selected signal</p>
              <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${selectedDistrict && selectedDistrict.crime_count >= districtAverage ? "bg-[#fff0ec] text-[#d9482b]" : "bg-[#edf5fa] text-[#4d84aa]"}`}>{selectedDistrict && selectedDistrict.crime_count >= districtAverage ? "Priority" : "Watch"}</span>
            </div>
            {selectedDistrict ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#fff0ec] text-[#d9482b]"><Crosshair size={19} /></span>
                  <div><h2 className="text-lg font-semibold">{selectedDistrict.district_name}</h2><p className="text-[10px] text-[#7b8796]">Karnataka district command</p></div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-[#f3f5f7] p-3"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#7b8796]">Registry reports</p><p className="mt-1 text-xl font-semibold">{selectedDistrict.crime_count}</p></div>
                  <div className="rounded-2xl bg-[#f3f5f7] p-3"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#7b8796]">Vs baseline</p><p className={`mt-1 text-lg font-semibold ${baselineDelta >= 0 ? "text-[#d9482b]" : "text-[#2d8178]"}`}>{baselineDelta >= 0 ? "+" : ""}{baselineDelta}%</p></div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-[#f3f5f7] p-3"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#7b8796]">State registry</p><p className="mt-1 text-xl font-semibold">{totalCrime.toLocaleString()}</p></div>
                  <div className="rounded-2xl bg-[#f3f5f7] p-3"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#7b8796]">Monitored units</p><p className="mt-1 text-xl font-semibold">24</p></div>
                </div>
                <p className="mt-4 text-xs leading-5 text-[#677487]">{selectedDistrict.top_crime_type} is the leading category, with {selectedLeadingTypeCount} registry-linked reports. Current filters show {filteredSelectedIncidents.length} mapped FIRs in this district.</p>
                <button type="button" onClick={() => setShowIncidents(true)} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263248] hover:shadow-lg">Open incident cluster <ChevronRight size={15} /></button>
              </>
            ) : <p className="mt-5 text-sm text-[#7b8796]">Select a district on the map to inspect it.</p>}
          </section>

          <section className="rounded-[26px] border border-white/90 bg-white/90 p-5 shadow-[0_22px_55px_rgba(33,48,67,0.1)] backdrop-blur">
            <div className="flex items-end justify-between">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#d9482b]">Priority queue</p><h2 className="mt-1 text-sm font-semibold">Hotspot ranking</h2></div>
              <TrendingUp size={17} className="text-[#70a5ca]" />
            </div>
            <ol className="mt-4 space-y-1.5">
              {rankedDistricts.map((district, index) => {
                const isActive = selectedDistrict?.district_name === district.district_name;
                return (
                  <li key={district.district_name}>
                    <button type="button" onClick={() => setSelectedDistrict(district)} className={`grid w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition ${isActive ? "bg-[#fff0ec]" : "hover:bg-[#f3f5f7]"}`}>
                      <span className="text-[9px] font-bold text-[#9aa4af]">0{index + 1}</span>
                      <span><span className="block text-xs font-semibold">{district.district_name}</span><span className="mt-0.5 block text-[9px] text-[#8b96a3]">{district.top_crime_type} · Live data</span></span>
                      <span className="text-xs font-semibold">{district.crime_count}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#e3e8ee] pt-4">
              <div className="rounded-2xl bg-[#f3f5f7] p-3"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#7b8796]">Open statewide</p><p className="mt-1 text-lg font-semibold">{statewideOpenCases}</p></div>
              <div className="rounded-2xl bg-[#f3f5f7] p-3"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#7b8796]">Priority FIRs</p><p className="mt-1 text-lg font-semibold">{statewidePriorityIncidents}</p></div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
