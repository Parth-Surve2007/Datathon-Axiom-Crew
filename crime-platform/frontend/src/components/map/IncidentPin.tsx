"use client";

import { CircleMarker, Tooltip } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { incidentTypeColors, type CrimeIncident } from "@/lib/map-data";

export function IncidentPin({ incident, onSelect }: { incident: CrimeIncident; onSelect: (incident: CrimeIncident) => void }) {
  const color = incidentTypeColors[incident.type];

  return (
    <CircleMarker
      center={[incident.lat, incident.lng]}
      radius={10}
      pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.94 }}
      eventHandlers={{
        click: (event: LeafletMouseEvent) => {
          event.originalEvent.stopPropagation();
          onSelect(incident);
        },
      }}
    >
      <Tooltip className="district-tooltip" direction="top" offset={[0, -8]} opacity={1}>
        <strong>{incident.type}</strong> | {incident.date} | {incident.location}
      </Tooltip>
    </CircleMarker>
  );
}
