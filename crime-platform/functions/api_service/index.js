'use strict';

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { loadIntelligenceTables } = require('./services/db.service');
const { buildPayload } = require('./services/intelligence.service');
const { answerQuery } = require('./services/ai.service');

const api = express();
const localApiOnly = process.env.LOCAL_API_ONLY === 'true';
const mapDistricts = [
  { district_name: 'Bengaluru Urban', crime_count: 482, lat: 12.9716, lng: 77.5946, top_crime_type: 'Theft', crime_breakdown: { theft: 196, assault: 104, robbery: 78, fraud: 104 } },
  { district_name: 'Mysuru', crime_count: 218, lat: 12.2958, lng: 76.6394, top_crime_type: 'Fraud', crime_breakdown: { theft: 70, assault: 48, robbery: 31, fraud: 69 } },
  { district_name: 'Hubballi-Dharwad', crime_count: 267, lat: 15.3647, lng: 75.124, top_crime_type: 'Theft', crime_breakdown: { theft: 101, assault: 63, robbery: 42, fraud: 61 } },
  { district_name: 'Belagavi', crime_count: 193, lat: 15.8497, lng: 74.4977, top_crime_type: 'Assault', crime_breakdown: { theft: 48, assault: 76, robbery: 25, fraud: 44 } },
  { district_name: 'Kalaburagi', crime_count: 241, lat: 17.3297, lng: 76.8343, top_crime_type: 'Assault', crime_breakdown: { theft: 54, assault: 96, robbery: 35, fraud: 56 } },
  { district_name: 'Mangaluru', crime_count: 176, lat: 12.9141, lng: 74.856, top_crime_type: 'Fraud', crime_breakdown: { theft: 55, assault: 29, robbery: 24, fraud: 68 } },
  { district_name: 'Shivamogga', crime_count: 149, lat: 13.9299, lng: 75.5681, top_crime_type: 'Theft', crime_breakdown: { theft: 61, assault: 38, robbery: 18, fraud: 32 } },
  { district_name: 'Ballari', crime_count: 204, lat: 15.1394, lng: 76.9214, top_crime_type: 'Robbery', crime_breakdown: { theft: 46, assault: 51, robbery: 64, fraud: 43 } },
];
const incidents = [
  { id: 'FIR-2024-001', type: 'Theft', lat: 12.9716, lng: 77.5946, location: 'MG Road, Bengaluru', date: '2024-03-15', accused: 'Ravi Kumar', victim: 'Suresh Nair', status: 'Under Investigation', district: 'Bengaluru Urban', severity: 'Medium', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-002', type: 'Fraud', lat: 12.9352, lng: 77.6245, location: 'Koramangala 5th Block', date: '2024-03-17', accused: "Anil D'Souza", victim: 'Priya Menon', status: 'Open', district: 'Bengaluru Urban', severity: 'Medium', ipc_section: 'IPC 420' },
  { id: 'FIR-2024-003', type: 'Assault', lat: 13.0098, lng: 77.5511, location: 'Rajajinagar Metro Station', date: '2024-03-21', accused: 'Unknown', victim: 'Mahesh Gowda', status: 'Chargesheet Filed', district: 'Bengaluru Urban', severity: 'High', ipc_section: 'IPC 323' },
  { id: 'FIR-2024-004', type: 'Robbery', lat: 12.9784, lng: 77.6408, location: 'Indiranagar 100 Feet Road', date: '2024-03-26', accused: 'Naveen Rao', victim: 'Farah Khan', status: 'Open', district: 'Bengaluru Urban', severity: 'High', ipc_section: 'IPC 392' },
  { id: 'FIR-2024-005', type: 'Robbery', lat: 12.2958, lng: 76.6394, location: 'Sayyaji Rao Road, Mysuru', date: '2024-03-10', accused: 'Unknown', victim: 'Meera Devi', status: 'Open', district: 'Mysuru', severity: 'High', ipc_section: 'IPC 392' },
  { id: 'FIR-2024-006', type: 'Theft', lat: 12.3052, lng: 76.6552, location: 'Devaraja Market', date: '2024-03-13', accused: 'Lokesh S', victim: 'Ganesh Bhat', status: 'Closed', district: 'Mysuru', severity: 'Low', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-007', type: 'Fraud', lat: 12.3234, lng: 76.6128, location: 'Vijayanagar 2nd Stage', date: '2024-03-19', accused: 'Pooja R', victim: 'Kiran Shetty', status: 'Under Investigation', district: 'Mysuru', severity: 'Medium', ipc_section: 'IPC 420' },
  { id: 'FIR-2024-008', type: 'Theft', lat: 15.3647, lng: 75.124, location: 'Station Road, Hubballi', date: '2024-03-11', accused: 'Manjunath H', victim: 'Raghavendra Kulkarni', status: 'Open', district: 'Hubballi-Dharwad', severity: 'Medium', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-009', type: 'Assault', lat: 15.4589, lng: 75.0078, location: 'Dharwad Court Circle', date: '2024-03-14', accused: 'Unknown', victim: 'Savita Patil', status: 'Under Investigation', district: 'Hubballi-Dharwad', severity: 'High', ipc_section: 'IPC 324' },
  { id: 'FIR-2024-010', type: 'Other', lat: 15.3496, lng: 75.1438, location: 'Gokul Road', date: '2024-03-20', accused: 'Prakash M', victim: 'Public Property', status: 'Closed', district: 'Hubballi-Dharwad', severity: 'Low', ipc_section: 'IPC 427' },
  { id: 'FIR-2024-011', type: 'Theft', lat: 15.8497, lng: 74.4977, location: 'Tilakwadi Market, Belagavi', date: '2024-03-09', accused: 'Unknown', victim: 'Shankar Joshi', status: 'Open', district: 'Belagavi', severity: 'Medium', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-012', type: 'Assault', lat: 15.8663, lng: 74.5134, location: 'Camp Area, Belagavi', date: '2024-03-18', accused: 'Sameer Nadaf', victim: 'Vijay Pawar', status: 'Chargesheet Filed', district: 'Belagavi', severity: 'Medium', ipc_section: 'IPC 323' },
  { id: 'FIR-2024-013', type: 'Fraud', lat: 15.8201, lng: 74.4882, location: 'Udyambag Industrial Estate', date: '2024-03-23', accused: 'Deepak Shah', victim: 'Mala Hiremath', status: 'Under Investigation', district: 'Belagavi', severity: 'Medium', ipc_section: 'IPC 420' },
  { id: 'FIR-2024-014', type: 'Assault', lat: 17.3297, lng: 76.8343, location: 'Super Market, Kalaburagi', date: '2024-03-08', accused: 'Ramesh K', victim: 'Imran Ali', status: 'Open', district: 'Kalaburagi', severity: 'High', ipc_section: 'IPC 324' },
  { id: 'FIR-2024-015', type: 'Theft', lat: 17.3521, lng: 76.8528, location: 'Aiwan-e-Shahi Road', date: '2024-03-16', accused: 'Unknown', victim: 'Sunita Desai', status: 'Under Investigation', district: 'Kalaburagi', severity: 'Low', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-016', type: 'Murder', lat: 17.3046, lng: 76.8073, location: 'Roza B Area', date: '2024-03-24', accused: 'Arif Khan', victim: 'Basavaraj P', status: 'Open', district: 'Kalaburagi', severity: 'High', ipc_section: 'IPC 302' },
  { id: 'FIR-2024-017', type: 'Fraud', lat: 12.9141, lng: 74.856, location: 'Hampankatta, Mangaluru', date: '2024-03-07', accused: 'Vincent Lobo', victim: 'Asha Rai', status: 'Under Investigation', district: 'Mangaluru', severity: 'Medium', ipc_section: 'IPC 420' },
  { id: 'FIR-2024-018', type: 'Theft', lat: 12.8864, lng: 74.8446, location: 'Pandeshwar Market', date: '2024-03-12', accused: 'Unknown', victim: 'Mohammed Faisal', status: 'Open', district: 'Mangaluru', severity: 'Low', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-019', type: 'Robbery', lat: 12.9417, lng: 74.8389, location: 'Bejai Main Road', date: '2024-03-22', accused: 'Ganesh Poojary', victim: 'Ritu Hegde', status: 'Chargesheet Filed', district: 'Mangaluru', severity: 'High', ipc_section: 'IPC 392' },
  { id: 'FIR-2024-020', type: 'Theft', lat: 13.9299, lng: 75.5681, location: 'Gandhi Bazaar, Shivamogga', date: '2024-03-06', accused: 'Harish N', victim: 'Naveen Kumar', status: 'Closed', district: 'Shivamogga', severity: 'Low', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-021', type: 'Assault', lat: 13.9442, lng: 75.5816, location: 'Sagar Road Junction', date: '2024-03-15', accused: 'Unknown', victim: 'Latha S', status: 'Under Investigation', district: 'Shivamogga', severity: 'Medium', ipc_section: 'IPC 323' },
  { id: 'FIR-2024-022', type: 'Fraud', lat: 13.9107, lng: 75.5469, location: 'Vinoba Nagar', date: '2024-03-27', accused: 'Karthik B', victim: 'Padma Rao', status: 'Open', district: 'Shivamogga', severity: 'Medium', ipc_section: 'IPC 420' },
  { id: 'FIR-2024-023', type: 'Robbery', lat: 15.1394, lng: 76.9214, location: 'Brucepet, Ballari', date: '2024-03-05', accused: 'Unknown', victim: 'Rohit Naik', status: 'Open', district: 'Ballari', severity: 'High', ipc_section: 'IPC 392' },
  { id: 'FIR-2024-024', type: 'Theft', lat: 15.1712, lng: 76.9517, location: 'Cowl Bazaar', date: '2024-03-11', accused: 'Mohan T', victim: 'Sanjana Reddy', status: 'Under Investigation', district: 'Ballari', severity: 'Medium', ipc_section: 'IPC 379' },
  { id: 'FIR-2024-025', type: 'Other', lat: 15.1223, lng: 76.8988, location: 'Hospet Road Checkpost', date: '2024-03-20', accused: 'Unknown', victim: 'State Transport Depot', status: 'Closed', district: 'Ballari', severity: 'Low', ipc_section: 'IPC 279' },
  { id: 'FIR-2024-026', type: 'Murder', lat: 12.9121, lng: 77.6446, location: 'HSR Layout Sector 7', date: '2024-03-28', accused: 'Sanjay V', victim: 'Arun B', status: 'Chargesheet Filed', district: 'Bengaluru Urban', severity: 'High', ipc_section: 'IPC 302' },
  { id: 'FIR-2024-027', type: 'Fraud', lat: 15.3861, lng: 75.0885, location: 'Vidyanagar, Hubballi', date: '2024-03-25', accused: 'Mehul Jain', victim: 'Nisha Kulkarni', status: 'Open', district: 'Hubballi-Dharwad', severity: 'Medium', ipc_section: 'IPC 420' },
  { id: 'FIR-2024-028', type: 'Robbery', lat: 17.3438, lng: 76.7906, location: 'MSK Mill Road, Kalaburagi', date: '2024-03-29', accused: 'Unknown', victim: 'Kavita Patil', status: 'Under Investigation', district: 'Kalaburagi', severity: 'High', ipc_section: 'IPC 392' },
];
api.use(express.json());
api.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

async function livePayload(req) {
  if (localApiOnly) return buildPayload(await loadIntelligenceTables());
  const app = catalyst.initialize(req, { scope: 'admin' });
  return buildPayload(await loadIntelligenceTables(app));
}

async function liveIntelligence(req) {
  if (localApiOnly) {
    const tables = await loadIntelligenceTables();
    return { tables, payload: buildPayload(tables) };
  }
  const app = catalyst.initialize(req, { scope: 'admin' });
  const tables = await loadIntelligenceTables(app);
  return { tables, payload: buildPayload(tables) };
}

function errorDetail(error) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object') {
    return error.description || error.details || error.code || JSON.stringify(error);
  }
  return String(error || 'Unknown Catalyst error');
}

api.get(['/', '/health'], async (req, res) => {
  try {
    const payload = await livePayload(req);
    res.json({ ok: true, source: payload.source, records: payload.summary.totalCases, generatedAt: payload.generatedAt });
  } catch (error) {
    res.status(500).json({ ok: false, error: errorDetail(error) });
  }
});

api.get('/tables', async (req, res) => {
  try {
    const app = catalyst.initialize(req, { scope: 'admin' });
    const tables = await app.datastore().getAllTables();
    res.json(tables.map((table) => table.tableDetails || table));
  } catch (error) {
    res.status(500).json({ error: errorDetail(error) });
  }
});

api.get('/intelligence', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await livePayload(req));
  } catch (error) {
    console.error('Catalyst intelligence query failed', error);
    res.status(500).json({ error: 'Unable to read the Catalyst Data Store.', detail: errorDetail(error) });
  }
});

api.get('/map', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(mapDistricts);
});

api.get('/incidents', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ incidents });
});

api.post('/chat', async (req, res) => {
  try {
    const { tables, payload } = await liveIntelligence(req);
    res.json(answerQuery(req.body?.query, payload, tables, req.body?.history));
  } catch (error) {
    res.status(500).json({ error: 'Unable to query live intelligence.', detail: errorDetail(error) });
  }
});

module.exports = api;
