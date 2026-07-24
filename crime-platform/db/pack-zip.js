'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const root = path.join(__dirname, '..');
const zipName = 'ksp_iac_tables.zip';
const zipPath = path.join(root, zipName);

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

// Extract inner zip paths from existing export zip if needed, or build new zip
const cmd = `powershell -Command "Compress-Archive -Path '${path.join(root, 'project-template-1.0.0.json')}' -DestinationPath '${zipPath}'"`;
execSync(cmd, { stdio: 'inherit' });

console.log(`Created IaC zip package at ${zipPath}`);
