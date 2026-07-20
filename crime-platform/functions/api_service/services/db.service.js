'use strict';

const fs = require('fs');
const path = require('path');
const PAGE_SIZE = 300;
const REQUIRED_TABLES = [
  'CaseMaster', 'Unit', 'District', 'Employee', 'CrimeHead', 'CrimeSubHead',
  'GravityOffence', 'CaseStatusMaster', 'Accused', 'ArrestSurrender',
  'ChargesheetDetails', 'Victim', 'ComplainantDetails', 'Inv_OccuranceTime',
  'ActSectionAssociation', 'Act', 'Section', 'OccupationMaster',
  'ReligionMaster', 'CasteMaster',
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
  const remoteTables = await app.datastore().getAllTables();
  const names = remoteTables.map((table) => table.toJSON?.().table_name || table.toJSON?.().name || table.tableDetails?.table_name).filter(Boolean);
  if (!names.length) return loadLocalSeed();
  const lookup = new Map(names.map((name) => [String(name).toLowerCase(), name]));
  const missing = REQUIRED_TABLES.filter((name) => !lookup.has(name.toLowerCase()));
  if (missing.length) return loadLocalSeed();
  const datasets = await Promise.all(REQUIRED_TABLES.map((name) => queryAll(app, lookup.get(name.toLowerCase()))));
  return { ...Object.fromEntries(REQUIRED_TABLES.map((name, index) => [name, datasets[index]])), __source: 'Zoho Catalyst Data Store' };
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
    path.resolve(process.cwd(), 'db/seed.sql'),
    path.resolve(__dirname, '../../../db/seed.sql'),
    path.resolve(__dirname, '../../../../db/seed.sql'),
  ].find((candidate) => fs.existsSync(candidate));
  if (!seedPath) throw new Error('Catalyst has no tables and db/seed.sql is unavailable for local fallback.');
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

module.exports = { loadIntelligenceTables };
