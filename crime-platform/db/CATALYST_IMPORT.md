# Catalyst Data Store import runbook

`schema.sql` is the canonical FIR model. `seed.sql` is the populated local fallback.

## Important distinction

`catalyst iac:export` copies project configuration and code, **not Data Store records**. Create the new project with IaC, then import table records separately.

## New Catalyst project

```powershell
catalyst iac:export
catalyst iac:status export
catalyst iac:import <exported-project.zip>
catalyst iac:status import
catalyst project:use <new-project-id-or-name>
```

Create Data Store tables with the exact names/columns from `schema.sql` and the ER diagram. Then create CSV data from the project's seed records:

```powershell
node db/export-seed-to-csv.js
```

Import the matching CSV into each Data Store table with `catalyst ds:import`; use `catalyst ds:import --help` for the current CLI arguments and `catalyst ds:status` to confirm each job.

Import parent tables before children: lookup tables first, then `Unit`/`Employee`/legal tables, then `CaseMaster`, then people, event, and chargesheet tables.

Build and deploy:

```powershell
cd frontend
npm run build
cd ..
catalyst deploy
```

Verify `/server/api_service/data-model`: its `source` must be `Zoho Catalyst Data Store`. If the cloud source is unreachable or incomplete, `/intelligence` switches completely to `db/seed.sql`; it never mixes cloud and local records.
