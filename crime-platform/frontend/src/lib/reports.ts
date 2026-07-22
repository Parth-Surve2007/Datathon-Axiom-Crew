"use client";

import { useSyncExternalStore } from "react";

export type ReportType = "Investigation" | "Incident Report" | "Intelligence Brief" | "Case Summary";
export type ReportStatus = "Draft" | "Under Review" | "Approved" | "Action Required";
export type ReportPriority = "Critical" | "High" | "Medium" | "Low";

export type ReportRecord = {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  priority: ReportPriority;
  district: string;
  station: string;
  leadOfficer: string;
  linkedFirs: string[];
  summary: string;
  findings: string;
  recommendations: string;
  classification: "Restricted" | "Confidential" | "Internal";
  createdAt: string;
  updatedAt: string;
};

export const starterReports: ReportRecord[] = [
  {
    id: "INV-2026-0148", title: "East corridor relay-theft network", type: "Investigation", status: "Under Review", priority: "Critical", district: "Bengaluru East", station: "Indiranagar PS", leadOfficer: "ACP Meera Kulkarni", linkedFirs: ["KA-2026-0482", "KA-2026-0511", "KA-2026-0547"], classification: "Restricted", createdAt: "2026-07-17T09:24:00.000Z", updatedAt: "2026-07-22T05:40:00.000Z", summary: "Coordinated vehicle thefts using relay devices across three adjoining station limits.", findings: "Matching entry windows, cloned key signals, and a shared disposal route connect the incidents. Two persons of interest overlap with a 2025 property-crime file.", recommendations: "Obtain tower dumps for the identified windows, compare toll-camera captures, and place the suspected disposal yard under discreet observation.",
  },
  {
    id: "IB-2026-0093", title: "Synthetic identity fraud cluster", type: "Intelligence Brief", status: "Action Required", priority: "High", district: "Bengaluru Central", station: "Cyber Crime PS", leadOfficer: "PI A. Prakash", linkedFirs: ["CY-2026-0318", "CY-2026-0341"], classification: "Confidential", createdAt: "2026-07-14T07:10:00.000Z", updatedAt: "2026-07-21T11:15:00.000Z", summary: "A linked group is using synthetic identities to open mule accounts and move proceeds from online investment fraud.", findings: "Four beneficiary accounts share device fingerprints and two introducer phone numbers. Transaction timing follows a repeated 18-hour dispersal cycle.", recommendations: "Initiate account-freeze requests, preserve KYC records, and refer the device cluster for cross-state matching.",
  },
  {
    id: "IR-2026-0264", title: "Festival-zone crowd incident assessment", type: "Incident Report", status: "Approved", priority: "Medium", district: "Mysuru City", station: "Devaraja PS", leadOfficer: "PSI Nandini Rao", linkedFirs: ["MY-2026-0194"], classification: "Internal", createdAt: "2026-07-09T13:05:00.000Z", updatedAt: "2026-07-18T08:30:00.000Z", summary: "Post-incident assessment of a crowd surge and opportunistic theft reports near the festival transit corridor.", findings: "The majority of complaints originated at two unlit pedestrian choke points between 20:30 and 22:00.", recommendations: "Revise barricade placement, add temporary lighting, and deploy plain-clothes teams at the two identified points.",
  },
  {
    id: "CS-2026-0181", title: "Repeat burglary series — Shivamogga", type: "Case Summary", status: "Draft", priority: "High", district: "Shivamogga", station: "Doddapete PS", leadOfficer: "Inspector Ravi Hegde", linkedFirs: ["SH-2026-0228", "SH-2026-0240", "SH-2026-0256"], classification: "Restricted", createdAt: "2026-07-19T16:42:00.000Z", updatedAt: "2026-07-21T09:12:00.000Z", summary: "Consolidated case summary for three commercial burglaries with common tool-mark evidence.", findings: "Entry method, target selection, and stolen-goods categories are consistent. A known receiver is geographically connected to all three locations.", recommendations: "Complete forensic comparison and conduct a coordinated interview of the receiver and two associated transporters.",
  },
  {
    id: "INV-2026-0129", title: "Coastal narcotics distribution inquiry", type: "Investigation", status: "Under Review", priority: "Critical", district: "Mangaluru", station: "CEN PS", leadOfficer: "DySP Fahad Khan", linkedFirs: ["MG-2026-0148", "MG-2026-0162"], classification: "Confidential", createdAt: "2026-07-02T06:20:00.000Z", updatedAt: "2026-07-20T14:05:00.000Z", summary: "Investigation into a distribution network moving narcotics through parcel aggregators and short-stay rentals.", findings: "Seven consignments share packaging traits. Financial review identifies a recurring set of low-value deposits before each delivery window.", recommendations: "Seek transaction records for the identified accounts and coordinate surveillance with the district narcotics unit.",
  },
  {
    id: "IR-2026-0279", title: "ATM tampering incident series", type: "Incident Report", status: "Action Required", priority: "High", district: "Tumakuru", station: "Town PS", leadOfficer: "PSI Kiran Gowda", linkedFirs: ["TK-2026-0207", "TK-2026-0213"], classification: "Restricted", createdAt: "2026-07-12T10:05:00.000Z", updatedAt: "2026-07-22T06:50:00.000Z", summary: "Two ATM kiosks were targeted using matching card-capture hardware during low-footfall hours.", findings: "Device construction and camera-obstruction methods are consistent with an interstate skimming group.", recommendations: "Circulate device imagery, obtain adjacent traffic footage, and coordinate with bank fraud teams.",
  },
  {
    id: "IB-2026-0101", title: "Highway cargo theft risk bulletin", type: "Intelligence Brief", status: "Approved", priority: "Medium", district: "Davanagere", station: "Rural PS", leadOfficer: "Inspector S. Manjunath", linkedFirs: ["DV-2026-0172", "DV-2026-0185", "DV-2026-0191"], classification: "Internal", createdAt: "2026-07-10T08:15:00.000Z", updatedAt: "2026-07-21T04:35:00.000Z", summary: "Night-time cargo theft reports are concentrating around two highway rest corridors.", findings: "Incidents peak between 01:00 and 03:30 and preferentially target parked textile consignments.", recommendations: "Increase mobile patrol overlap and issue a preventive advisory to fleet operators.",
  },
  {
    id: "CS-2026-0198", title: "Online recruitment scam case summary", type: "Case Summary", status: "Draft", priority: "Medium", district: "Kalaburagi", station: "Cyber Crime PS", leadOfficer: "PSI Shweta Patil", linkedFirs: ["KG-2026-0288", "KG-2026-0294"], classification: "Restricted", createdAt: "2026-07-18T12:45:00.000Z", updatedAt: "2026-07-22T03:25:00.000Z", summary: "Victims were induced to pay staged onboarding fees through cloned recruitment portals.", findings: "Both portals reused analytics identifiers and routed payments to the same beneficiary chain.", recommendations: "Preserve hosting records and seek expedited beneficiary-account details.",
  },
  {
    id: "INV-2026-0156", title: "Illegal sand transport network", type: "Investigation", status: "Under Review", priority: "High", district: "Mandya", station: "Srirangapatna PS", leadOfficer: "ACP Raghavendra B.", linkedFirs: ["MN-2026-0115", "MN-2026-0131", "MN-2026-0144"], classification: "Confidential", createdAt: "2026-07-08T05:30:00.000Z", updatedAt: "2026-07-20T16:10:00.000Z", summary: "An organised transport network is suspected of moving illegally extracted sand using altered permits.", findings: "Six vehicles cycle between two river-access points and a common storage yard after midnight.", recommendations: "Verify permit QR logs and conduct a joint transport-department interception.",
  },
  {
    id: "IR-2026-0292", title: "School-zone safety incident review", type: "Incident Report", status: "Approved", priority: "Low", district: "Udupi", station: "Manipal PS", leadOfficer: "PSI Deepa Shetty", linkedFirs: ["UD-2026-0089"], classification: "Internal", createdAt: "2026-07-15T09:00:00.000Z", updatedAt: "2026-07-19T07:45:00.000Z", summary: "Review of repeated traffic conflicts and one minor collision near a school access road.", findings: "Unregulated pickup parking obscures the pedestrian crossing during morning arrival.", recommendations: "Create a timed no-parking zone and deploy wardens during arrival and dismissal.",
  },
  {
    id: "IB-2026-0114", title: "Communal misinformation early-warning brief", type: "Intelligence Brief", status: "Action Required", priority: "Critical", district: "Ballari", station: "District Special Branch", leadOfficer: "DySP Lakshmi Devi", linkedFirs: ["BL-2026-0166"], classification: "Confidential", createdAt: "2026-07-20T14:20:00.000Z", updatedAt: "2026-07-22T07:05:00.000Z", summary: "A recycled video is gaining local circulation with false claims tied to an upcoming public gathering.", findings: "Amplification originates from a small cluster of recently created accounts and two local forwarding groups.", recommendations: "Publish a verified clarification, monitor escalation indicators, and brief local peace committees.",
  },
  {
    id: "CS-2026-0204", title: "Warehouse fire and theft examination", type: "Case Summary", status: "Draft", priority: "High", district: "Hassan", station: "Extension PS", leadOfficer: "Inspector P. Suresh", linkedFirs: ["HS-2026-0127"], classification: "Restricted", createdAt: "2026-07-21T02:40:00.000Z", updatedAt: "2026-07-22T06:15:00.000Z", summary: "Case summary examining whether a warehouse fire was used to conceal inventory theft.", findings: "Stock discrepancies predate the fire and rear-gate access logs contain an unexplained credential event.", recommendations: "Complete accelerant analysis and reconcile supplier invoices with gate-camera records.",
  },
];

const STORAGE_KEY = "kangavalu-reports-v1";
const EVENT_NAME = "kangavalu-reports-changed";
let cachedRaw = "";
let cachedReports = starterReports;

function readReports() {
  if (typeof window === "undefined") return starterReports;
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw === cachedRaw) return cachedReports;
  cachedRaw = raw;
  if (!raw) {
    cachedReports = starterReports;
    return cachedReports;
  }
  try {
    const stored = JSON.parse(raw) as ReportRecord[];
    cachedReports = [...stored, ...starterReports.filter((starter) => !stored.some((report) => report.id === starter.id))];
  } catch {
    cachedReports = starterReports;
  }
  return cachedReports;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(EVENT_NAME, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(EVENT_NAME, listener);
  };
}

function writeReports(reports: ReportRecord[]) {
  cachedReports = reports;
  cachedRaw = JSON.stringify(reports);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useReports() {
  return useSyncExternalStore(subscribe, readReports, () => starterReports);
}

export function saveReport(report: ReportRecord) {
  const reports = readReports();
  const existingIndex = reports.findIndex((item) => item.id === report.id);
  writeReports(existingIndex >= 0 ? reports.map((item) => item.id === report.id ? report : item) : [report, ...reports]);
}

export function updateReportStatus(id: string, status: ReportStatus) {
  writeReports(readReports().map((report) => report.id === id ? { ...report, status, updatedAt: new Date().toISOString() } : report));
}

export function createReportId(type: ReportType) {
  const prefix: Record<ReportType, string> = { Investigation: "INV", "Incident Report": "IR", "Intelligence Brief": "IB", "Case Summary": "CS" };
  return `${prefix[type]}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}
