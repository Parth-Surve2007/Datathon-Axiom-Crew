'use strict';

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { loadIntelligenceTables } = require('./services/db.service');
const { buildPayload } = require('./services/intelligence.service');
const { answerQuery } = require('./services/ai.service');

const api = express();
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
  const app = catalyst.initialize(req, { scope: 'admin' });
  return buildPayload(await loadIntelligenceTables(app));
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

api.post('/chat', async (req, res) => {
  try {
    const payload = await livePayload(req);
    res.json({ answer: answerQuery(req.body?.query, payload), generatedAt: payload.generatedAt, source: payload.source });
  } catch (error) {
    res.status(500).json({ error: 'Unable to query live intelligence.', detail: errorDetail(error) });
  }
});

module.exports = api;
