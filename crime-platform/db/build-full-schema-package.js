'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const root = path.join(__dirname, '..');
const exportZip = path.join(root, 'export_49792000000052001_14954147913200.zip');
const tempDir = path.join(__dirname, 'iac_temp_schema');
const outZip = path.join(root, 'valid_catalyst_iac_import.zip');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

fs.mkdirSync(tempDir, { recursive: true });

// Extract original valid zip
execSync(`tar -xf "${exportZip}" -C "${tempDir}"`, { stdio: 'inherit' });

const jsonPath = path.join(tempDir, 'project-template-1.0.0.json');
const template = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
const inserts = /INSERT INTO\s+([A-Za-z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\((.*?)\);/gis;

function splitValues(input) {
  const values = []; let current = ''; let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === "'") {
      if (quoted && input[i + 1] === "'") { current += "'"; i += 1; } else quoted = !quoted;
    } else if (char === ',' && !quoted) { values.push(current.trim()); current = ''; } else current += char;
  }
  values.push(current.trim());
  return values;
}

const tableColumns = new Map();
for (const match of sql.matchAll(inserts)) {
  const table = match[1];
  const cols = match[2].split(',').map((c) => c.trim());
  const vals = splitValues(match[3]);
  if (!tableColumns.has(table)) {
    tableColumns.set(table, cols.map((col, idx) => ({
      name: col,
      sample: vals[idx]
    })));
  }
}

const datastoreComponents = [];

for (const [table, cols] of tableColumns) {
  // Add Table
  datastoreComponents.push({
    type: "table",
    name: table,
    properties: { table_name: table },
    dependsOn: []
  });

  // Add Columns for Table
  for (const colObj of cols) {
    const colName = colObj.name;
    const sample = colObj.sample;
    const isNum = /^-?\d+$/.test(sample);

    datastoreComponents.push({
      type: "column",
      name: `${table}-${colName}`,
      properties: {
        audit_consent: false,
        decimal_digits: 2,
        column_name: colName,
        data_type: isNum ? "bigint" : "varchar",
        is_unique: false,
        is_mandatory: false,
        search_index_enabled: false,
        table_id: table,
        table_name: table,
        max_length: isNum ? 19 : 255
      },
      dependsOn: [`Datastore.table.${table}`]
    });
  }

  // Add tableScope for Table
  datastoreComponents.push({
    type: "tableScope",
    name: `${table}-App Administrator`,
    properties: {
      role_name: "App Administrator",
      table_scope: "GLOBAL",
      type: "App Administrator",
      table_name: table
    },
    dependsOn: [`Datastore.table.${table}`]
  });
}

template.components.Datastore = datastoreComponents;
fs.writeFileSync(jsonPath, JSON.stringify(template, null, 2), 'utf8');

// Compress back to zip
const cmd = `powershell -Command "Set-Location '${tempDir}'; Compress-Archive -Path '*' -DestinationPath '${outZip}'"`;
execSync(cmd, { stdio: 'inherit' });

console.log(`Generated valid_catalyst_iac_import.zip with ${tableColumns.size} tables and ${datastoreComponents.length} schema components.`);
