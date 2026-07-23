"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L, { type Layer } from "leaflet";
import { GeoJSON, MapContainer, useMap } from "react-leaflet";
import type { Feature, FeatureCollection, GeoJsonObject } from "geojson";
import type { CrimeIncident, DistrictCrimeData } from "@/lib/map-data";
import { MapLegend } from "./MapLegend";
import { IncidentPin } from "./IncidentPin";
import { IncidentReportPanel } from "./IncidentReportPanel";

// A local high-resolution boundary file can be dropped into public/ for demos,
// but the committed app falls back to these lightweight monitored districts.
const KARNATAKA_GEOJSON_URL = "/app/karnataka.geojson";
const fallbackBoundaryGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { district_name: "Belagavi" }, geometry: { type: "Polygon", coordinates: [[[74.12, 15.58], [74.86, 15.58], [74.96, 16.1], [74.58, 16.38], [74.08, 16.18], [74.12, 15.58]]] } },
    { type: "Feature", properties: { district_name: "Hubballi-Dharwad" }, geometry: { type: "Polygon", coordinates: [[[74.78, 15.1], [75.44, 15.08], [75.58, 15.52], [75.12, 15.78], [74.72, 15.48], [74.78, 15.1]]] } },
    { type: "Feature", properties: { district_name: "Kalaburagi" }, geometry: { type: "Polygon", coordinates: [[[76.38, 17.0], [77.2, 17.02], [77.38, 17.56], [76.9, 17.9], [76.26, 17.58], [76.38, 17.0]]] } },
    { type: "Feature", properties: { district_name: "Shivamogga" }, geometry: { type: "Polygon", coordinates: [[[75.18, 13.62], [75.84, 13.58], [76.0, 14.12], [75.55, 14.42], [75.05, 14.06], [75.18, 13.62]]] } },
    { type: "Feature", properties: { district_name: "Ballari" }, geometry: { type: "Polygon", coordinates: [[[76.5, 14.82], [77.2, 14.92], [77.38, 15.38], [76.9, 15.68], [76.34, 15.32], [76.5, 14.82]]] } },
    { type: "Feature", properties: { district_name: "Mysuru" }, geometry: { type: "Polygon", coordinates: [[[76.22, 12.02], [76.84, 12.04], [76.94, 12.48], [76.48, 12.72], [76.05, 12.42], [76.22, 12.02]]] } },
    { type: "Feature", properties: { district_name: "Bengaluru Urban" }, geometry: { type: "Polygon", coordinates: [[[77.36, 12.78], [77.82, 12.8], [77.9, 13.1], [77.62, 13.24], [77.3, 13.08], [77.36, 12.78]]] } },
    { type: "Feature", properties: { district_name: "Mangaluru" }, geometry: { type: "Polygon", coordinates: [[[74.62, 12.72], [75.06, 12.72], [75.12, 13.12], [74.82, 13.38], [74.52, 13.1], [74.62, 12.72]]] } },
  ],
};
const forecastHotspots = new Set(["Bengaluru Urban", "Hubballi-Dharwad", "Kalaburagi"]);
const districtAliases: Record<string, string> = {
  bangalore: "Bengaluru Urban", bengaluru: "Bengaluru Urban", mysore: "Mysuru", dharwad: "Hubballi-Dharwad",
  belgaum: "Belagavi", gulbarga: "Kalaburagi", "dakshina kannada": "Mangaluru", shimoga: "Shivamogga", bellary: "Ballari",
};
const incidentPoints: Array<[number, number, number]> = [
  [12.972, 77.595, 1], [12.94, 77.61, 0.9], [13.02, 77.56, 0.8], [12.91, 77.64, 0.85],
  [12.296, 76.639, 0.6], [12.33, 76.65, 0.45], [15.365, 75.124, 0.65], [15.39, 75.1, 0.55],
  [15.85, 74.498, 0.5], [17.33, 76.834, 0.62], [17.36, 76.86, 0.55], [12.914, 74.856, 0.48],
  [13.93, 75.568, 0.4], [15.139, 76.921, 0.52], [15.17, 76.95, 0.42],
];

function canonicalDistrict(value: unknown) {
  const cleaned = String(value || "").trim();
  return districtAliases[cleaned.toLowerCase()] || cleaned;
}

function districtName(feature?: Feature) {
  const properties = feature?.properties || {};
  return canonicalDistrict(properties.DISTRICT || properties.district || properties.district_name || properties.REGNAME || properties.DIST_NAME || properties.name || properties.NAME_2);
}

function crimeColor(value: number) {
  if (value >= 400) return "#800026";
  if (value >= 300) return "#bd0026";
  if (value >= 220) return "#e31a1c";
  if (value >= 160) return "#fd8d3c";
  return "#ffffd4";
}

function HeatLayer({ active }: { active: boolean }) {
  const map = useMap();
  const layerRef = useRef<Layer | null>(null);
  useEffect(() => {
    if (!active) return;
    let mounted = true;
    void import("leaflet.heat").then(() => {
      if (!mounted) return;
      const heatLayer = L.heatLayer(incidentPoints, { radius: 30, blur: 20, maxZoom: 8, minOpacity: 0.4, gradient: { 0.2: "#ffffd4", 0.5: "#fd8d3c", 0.8: "#e31a1c", 1: "#800026" } });
      heatLayer.addTo(map);
      layerRef.current = heatLayer;
    });
    return () => { mounted = false; layerRef.current?.remove(); layerRef.current = null; };
  }, [active, map]);
  return null;
}

function BaseTileLayer() {
  const map = useMap();

  useEffect(() => {
    let frame = 0;
    let layer: L.TileLayer | null = null;
    let cancelled = false;

    const mountLayer = () => {
      if (cancelled) return;

      if (!map.getPane("tilePane")) {
        frame = window.requestAnimationFrame(mountLayer);
        return;
      }

      layer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      });
      layer.addTo(map);
    };

    mountLayer();

    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
      layer?.remove();
    };
  }, [map]);

  return null;
}

function FlyToDistrict({ district }: { district: DistrictCrimeData | null }) {
  const map = useMap();

  useEffect(() => {
    if (district) {
      map.flyTo([district.lat, district.lng], Math.max(map.getZoom(), 8), {
        duration: 0.75,
      });
    }
  }, [district, map]);

  return null;
}

export function MapView({
  districts,
  heatmap,
  forecast,
  showIncidents,
  incidents,
  reportIncidents,
  selectedDistrict,
  onDistrictSelect,
  className,
}: {
  districts: DistrictCrimeData[];
  heatmap: boolean;
  forecast: boolean;
  showIncidents: boolean;
  incidents: CrimeIncident[];
  reportIncidents: CrimeIncident[];
  selectedDistrict?: DistrictCrimeData | null;
  onDistrictSelect?: (district: DistrictCrimeData) => void;
  className?: string;
}) {
  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(null);
  const [boundaryError, setBoundaryError] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<CrimeIncident | null>(null);
  const [hovered, setHovered] = useState("");
  const lookup = useMemo(() => new Map(districts.map((district) => [district.district_name, district])), [districts]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(KARNATAKA_GEOJSON_URL, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error(`Boundary request failed: ${response.status}`);
      return response.json();
    }).then(setGeoJson).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Unable to load Karnataka district boundaries", error);
        setGeoJson(fallbackBoundaryGeoJson);
        setBoundaryError(false);
      }
    });
    return () => controller.abort();
  }, []);

  return (
    <div className={`relative h-[calc(100dvh-12rem)] min-h-[580px] overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0f] shadow-2xl ${className ?? ""}`}>
      <MapContainer center={[15.25, 75.75]} zoom={7} minZoom={6} scrollWheelZoom className="h-full w-full bg-[#0a0a0f]" aria-label="Karnataka district crime map">
        <BaseTileLayer />
        <FlyToDistrict district={selectedDistrict ?? null} />
        {geoJson && !heatmap && <GeoJSON
          key={`${forecast}-${hovered}-${selectedDistrict?.district_name ?? ""}`}
          data={geoJson}
          style={(feature) => {
            const name = districtName(feature);
            const district = lookup.get(name);
            const isForecast = forecast && forecastHotspots.has(name);
            const isSelected = selectedDistrict?.district_name === name;
            return { color: isForecast ? "#ff3b30" : isSelected ? "#7dd3fc" : "#fff", weight: isForecast || isSelected ? 3 : hovered === name ? 2.5 : 1, dashArray: isForecast ? "7 5" : undefined, fillColor: district ? crimeColor(district.crime_count) : "#32343d", fillOpacity: district ? (isSelected ? 0.92 : 0.72) : 0.22, className: isForecast ? "forecast-district" : undefined };
          }}
          onEachFeature={(feature, layer) => {
            const name = districtName(feature);
            const district = lookup.get(name);
            if (!district) return;
            layer.bindTooltip(`<strong>${district.district_name}</strong><br/>${district.crime_count} crime reports<br/><span>${district.top_crime_type} leads</span>`, { sticky: true, className: "district-tooltip", direction: "top" });
            layer.on({ mouseover: () => setHovered(name), mouseout: () => setHovered(""), click: () => { setSelectedIncident(null); onDistrictSelect?.(district); } });
          }}
        />}
        <HeatLayer active={heatmap} />
        {showIncidents && incidents.map((incident) => (
          <IncidentPin
            key={incident.id}
            incident={incident}
            onSelect={(nextIncident) => {
              setSelectedIncident(nextIncident);
            }}
          />
        ))}
      </MapContainer>
      {!geoJson && <div className="absolute inset-0 z-[500] grid place-items-center bg-[#0a0a0f]/70 text-sm text-white/70">{boundaryError ? "Unable to load Karnataka district boundaries." : "Loading Karnataka district boundaries..."}</div>}
      <div className="pointer-events-none absolute bottom-5 left-5 z-[900]"><MapLegend /></div>
      <div className="pointer-events-none absolute left-5 top-5 z-[900] rounded-md border border-white/10 bg-[#101119]/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur"><span className="font-semibold text-[#fed976]">{heatmap ? "Heatmap" : "District choropleth"}</span><span className="ml-2 text-white/50">{districts.length} monitored districts</span></div>
      {forecast && <div className="pointer-events-none absolute bottom-5 right-5 z-[900] rounded-md border border-red-400/30 bg-[#301114]/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-200">Forecast hotspots active</div>}
      {selectedIncident && <IncidentReportPanel incident={selectedIncident} incidents={reportIncidents} onClose={() => setSelectedIncident(null)} />}
    </div>
  );
}
