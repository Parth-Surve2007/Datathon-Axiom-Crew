'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const root = path.join(__dirname, '..');
const exportZip = path.join(root, 'export_49792000000052001_14954147913200.zip');
const tempDir = path.join(__dirname, 'iac_temp');
const outZip = path.join(root, 'valid_catalyst_iac_import.zip');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

fs.mkdirSync(tempDir, { recursive: true });

// Extract original valid zip
execSync(`tar -xf "${exportZip}" -C "${tempDir}"`, { stdio: 'inherit' });

const jsonPath = path.join(tempDir, 'project-template-1.0.0.json');
const template = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const REQUIRED_TABLES = [
  'State', 'District', 'UnitType', 'Unit', 'Rank', 'Designation', 'Employee',
  'CaseCategory', 'GravityOffence', 'CrimeHead', 'CrimeSubHead', 'Act', 'Section',
  'CrimeHeadActSection', 'Court', 'CaseStatusMaster', 'CasteMaster',
  'ReligionMaster', 'OccupationMaster', 'CaseMaster', 'Inv_OccuranceTime',
  'ComplainantDetails', 'ActSectionAssociation', 'Victim', 'Accused',
  'ArrestSurrender', 'inv_arrestsurrenderaccused', 'ChargesheetDetails'
];

const datastoreComponents = [];

for (const table of REQUIRED_TABLES) {
  datastoreComponents.push({
    type: "table",
    name: table,
    properties: { table_name: table },
    dependsOn: []
  });
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

console.log(`Created complete IaC import package at ${outZip}`);
