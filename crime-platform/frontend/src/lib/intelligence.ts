export type RangeKey = "Week" | "Month" | "Quarter";

export type IntelligencePayload = {
  source: string;
  generatedAt: string;
  summary: {
    totalCases: number;
    underInvestigation: number;
    chargeSheeted: number;
    closed: number;
    arrests: number;
    highPriority: number;
  };
  pulse: Record<RangeKey, { labels: string[]; values: number[] }>;
  investigations: Array<{
    id: string;
    title: string;
    status: string;
    district: string;
    age: string;
    tags: string[];
    detail: string;
  }>;
  fieldUnits: Array<{ initials: string; name: string; role: string; state: string }>;
  pipeline: Array<{ label: string; value: number }>;
  analytics: {
    monthly: Array<Record<string, string | number> & { name: string }>;
    categories: Array<{ key: string; label: string; color: string; soft: string; value: number }>;
    trend: Array<{ name: string; incidents: number }>;
  };
  hotspots: Array<{
    id: string;
    label: string;
    district: string;
    station: string;
    type: string;
    cases: number;
    change: string;
    risk: "Critical" | "Elevated" | "Watch";
    x: number;
    y: number;
    summary: string;
    updated: string;
  }>;
  network: {
    nodes: Array<{
      id: string;
      label: string;
      subtitle: string;
      kind: "Person" | "Case" | "Asset" | "Place" | "Organisation";
      risk: number;
      x: number;
      y: number;
      attributes: Array<{ label: string; value: string }>;
    }>;
    edges: Array<{ id: string; source: string; target: string; label: string; strength: number }>;
  };
};

export const catalystApiBase =
  process.env.NEXT_PUBLIC_CATALYST_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001/server/api_service";

