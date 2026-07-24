'use strict';

const fs = require('fs');
const path = require('path');
const PAGE_SIZE = 300;
// This is the complete canonical entity set from Police_FIR_ER_Diagram.pdf.
// Keep this list exact: when a Catalyst Data Store project is missing even one
// entity or has empty tables, we deliberately use the local seed rather than mix cloud and local
// records in one dashboard response.
const REQUIRED_TABLES = [
  'State', 'District', 'UnitType', 'Unit', 'Rank', 'Designation', 'Employee',
  'CaseCategory', 'GravityOffence', 'CrimeHead', 'CrimeSubHead', 'Act', 'Section',
  'CrimeHeadActSection', 'Court', 'CaseStatusMaster', 'CasteMaster',
  'ReligionMaster', 'OccupationMaster', 'CaseMaster', 'Inv_OccuranceTime',
  'ComplainantDetails', 'ActSectionAssociation', 'Victim', 'Accused',
  'ArrestSurrender', 'inv_arrestsurrenderaccused', 'ChargesheetDetails',
];

function flattenRow(value, target = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return target;
  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      flattenRow(child, target);
    } else if (!(key in target)) {
      target[key] = child;
    }
  }
  return target;
}

async function queryAll(app, table, columns = '*') {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const result = await app.zcql().executeZCQLQuery(
      `SELECT ${columns} FROM ${table} LIMIT ${offset}, ${PAGE_SIZE}`,
    );
    const page = result.map((row) => flattenRow(row));
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

async function loadIntelligenceTables(app) {
  if (!app) return loadLocalSeed();
  try {
    const remoteTables = await app.datastore().getAllTables();
    const names = remoteTables.map((table) => table.toJSON?.().table_name || table.toJSON?.().name || table.tableDetails?.table_name).filter(Boolean);
    if (!names.length) return loadLocalSeed();
    const lookup = new Map(names.map((name) => [String(name).toLowerCase(), name]));
    const missing = REQUIRED_TABLES.filter((name) => !lookup.has(name.toLowerCase()));
    if (missing.length) return loadLocalSeed();

    // Query tables sequentially to prevent hitting Catalyst ZCQL HTTP 429 rate limit
    const datasets = [];
    for (const name of REQUIRED_TABLES) {
      const data = await queryAll(app, lookup.get(name.toLowerCase()));
      datasets.push(data);
    }

    // Check if total records across all Data Store tables is zero
    const totalRecords = datasets.reduce((sum, rows) => sum + (rows ? rows.length : 0), 0);
    if (totalRecords === 0) {
      console.warn('Catalyst Data Store tables exist but are empty (0 rows). Serving local seed fallback for full dashboard data.');
      return loadLocalSeed();
    }

    return { ...Object.fromEntries(REQUIRED_TABLES.map((name, index) => [name, datasets[index]])), __source: 'Zoho Catalyst Data Store' };
  } catch (err) {
    console.warn('Catalyst Data Store query failed or rate-limited (HTTP 429), using fallback seed:', err.message || err);
    return loadLocalSeed();
  }
}

async function seedDataStoreTables(app) {
  if (!app) throw new Error('Catalyst SDK instance is required to populate Data Store');
  const localData = loadLocalSeed();
  const results = {};

  for (const table of REQUIRED_TABLES) {
    const rows = localData[table] || [];
    if (!rows.length) {
      results[table] = 0;
      continue;
    }

    let insertedCount = 0;
    const tableInstance = app.datastore().table(table);

    // Batch insert 20 rows per request to conform to Catalyst API limits
    for (let i = 0; i < rows.length; i += 20) {
      const batch = rows.slice(i, i + 20);
      try {
        await tableInstance.insertRows(batch);
        insertedCount += batch.length;
      } catch (err) {
        console.error(`Error populating table ${table} batch at ${i}:`, err.message || err);
      }
    }
    results[table] = insertedCount;
  }
  return results;
}

function splitSqlValues(input) {
  const values = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === "'") {
      if (quoted && input[index + 1] === "'") {
        current += "'";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function sqlValue(value) {
  if (/^null$/i.test(value)) return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function loadLocalSeed() {
  const seedPath = [
    path.resolve(__dirname, '../seed.sql'),
    path.resolve(__dirname, 'seed.sql'),
    path.resolve(process.cwd(), 'db/seed.sql'),
    path.resolve(process.cwd(), 'seed.sql'),
    path.resolve(__dirname, '../../../db/seed.sql'),
    path.resolve(__dirname, '../../../../db/seed.sql'),
  ].find((candidate) => fs.existsSync(candidate));
  if (!seedPath) throw new Error('Catalyst has no populated tables and seed.sql is unavailable.');
  const tables = Object.fromEntries(REQUIRED_TABLES.map((name) => [name, []]));
  const sql = fs.readFileSync(seedPath, 'utf8');
  const insertPattern = /INSERT INTO\s+([A-Za-z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\((.*?)\);/gis;
  for (const match of sql.matchAll(insertPattern)) {
    const table = REQUIRED_TABLES.find((name) => name.toLowerCase() === match[1].toLowerCase());
    if (!table) continue;
    const columns = match[2].split(',').map((column) => column.trim());
    const values = splitSqlValues(match[3]).map(sqlValue);
    tables[table].push(Object.fromEntries(columns.map((column, index) => [column, values[index]])));
  }
  return { ...tables, __source: 'Local SQL mirror · Catalyst-ready' };
}

module.exports = { loadIntelligenceTables, seedDataStoreTables, REQUIRED_TABLES, loadLocalSeed };
