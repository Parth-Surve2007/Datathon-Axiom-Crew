'use strict';

// Converts the single-row INSERT statements in seed.sql into per-table CSV
// files for Catalyst Data Store bulk import. It never executes SQL.
const fs = require('fs');
const path = require('path');
const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
const outputDir = path.join(__dirname, 'catalyst-import');

function splitValues(input) {
  const values = []; let current = ''; let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === "'") {
      if (quoted && input[i + 1] === "'") { current += "'"; i += 1; } else quoted = !quoted;
    } else if (char === ',' && !quoted) { values.push(current.trim()); current = ''; } else current += char;
  }
  values.push(current.trim());
  return values.map((value) => (/^null$/i.test(value) ? '' : value));
}

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const grouped = new Map();
const inserts = /INSERT INTO\s+([A-Za-z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\((.*?)\);/gis;
for (const match of sql.matchAll(inserts)) {
  const table = match[1]; const columns = match[2].split(',').map((value) => value.trim());
  const values = splitValues(match[3]); const group = grouped.get(table) || { columns, rows: [] };
  if (group.columns.join('|') !== columns.join('|')) throw new Error(`Inconsistent INSERT columns for ${table}`);
  group.rows.push(values); grouped.set(table, group);
}
fs.mkdirSync(outputDir, { recursive: true });
for (const [table, { columns, rows }] of grouped) {
  const data = [columns.map(csvCell).join(','), ...rows.map((row) => row.map(csvCell).join(','))].join('\n');
  fs.writeFileSync(path.join(outputDir, `${table}.csv`), data, 'utf8');
}
console.log(`Wrote ${grouped.size} CSV files to ${outputDir}`);
