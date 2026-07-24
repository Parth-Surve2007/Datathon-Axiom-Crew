# Kangavalu - KSP Crime Intelligence Command Workspace

Kangavalu is an operational intelligence workspace built for the Karnataka State Police crime intelligence datathon. It brings FIR data, district-level analytics, incident reports, maps, network views, and AI-assisted investigation workflows into one web platform.

## What It Includes

- **Command dashboard**: Live incident metrics, priority case queues, field unit telemetry, and investigation pipeline summaries.
- **Intelligence assistant**: Natural-language investigation support for searching FIRs, finding associates, retrieving case details, and generating crime statistics.
- **Analytics workspace**: Trend, category, and district-level visualizations for crime intelligence review.
- **Geospatial map**: District and incident mapping with filters, pins, legends, and incident detail panels.
- **Network graph**: Entity and case relationship exploration for suspects, locations, assets, and investigations.
- **Reports module**: Incident report creation, documentation support, and report export helpers.

## Tech Stack

### Frontend

Location: `crime-platform/frontend/`

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Framer Motion
- Recharts
- Leaflet and React Leaflet
- Lucide React icons
- UX4G component packages

### Backend

Location: `crime-platform/functions/`

- `api_service`: lightweight Catalyst-compatible Express function used by the frontend live intelligence endpoints.
- `ml_backend`: TypeScript Express API with layered controllers, services, repositories, AI orchestration, retrieval, citations, reports, and graph modules.

### Data

Location: `crime-platform/db/`

- `schema.sql`: database schema
- `seed.sql`: canonical local seed dataset
- `migrations/`: database migrations
- `verify.js` and `seed.js`: database utility scripts

## Repository Structure

```text
.
|-- README.md
`-- crime-platform/
    |-- LOCAL_DEVELOPMENT.md
    |-- catalyst.json
    |-- db/
    |   |-- schema.sql
    |   |-- seed.sql
    |   `-- migrations/
    |-- frontend/
    |   |-- src/
    |   |   |-- app/
    |   |   |-- components/
    |   |   |-- hooks/
    |   |   `-- lib/
    |   |-- public/
    |   |-- next.config.ts
    |   `-- package.json
    `-- functions/
        |-- api_service/
        |   |-- index.js
        |   |-- local-server.js
        |   |-- services/
        |   `-- package.json
        `-- ml_backend/
            |-- src/
            |   |-- ai/
            |   |-- analytics/
            |   |-- controllers/
            |   |-- repositories/
            |   |-- routes/
            |   |-- services/
            |   `-- server.ts
            |-- docs/
            `-- package.json
```

## Local Development

Run the API and frontend in separate terminals.

### 1. Install dependencies

```powershell
cd crime-platform\functions\api_service
npm install

cd ..\ml_backend
npm install

cd ..\..\frontend
npm install
```

### 2. Start the local API service

For teammates without access to the linked Zoho Catalyst project:

```powershell
cd crime-platform\functions\api_service
npm run serve:local
```

The local API runs at:

```text
http://localhost:3001/server/api_service
```

Health check:

```text
http://localhost:3001/server/api_service/health
```

If your Catalyst account has access to the linked project, you can serve the function through Catalyst instead:

```powershell
cd crime-platform
catalyst serve --http 3001 --no-open
```

### 3. Start the frontend

```powershell
cd crime-platform\frontend
npm run dev
```

Open:

```text
http://localhost:3000/app/dashboard
```

The frontend polls:

```text
http://localhost:3001/server/api_service/intelligence
```

Set `NEXT_PUBLIC_CATALYST_API_URL` only if your local API URL differs. See `crime-platform/frontend/.env.local.example`.

## ML Backend

The TypeScript backend can be run independently for development:

```powershell
cd crime-platform\functions\ml_backend
npm run dev
```

Useful scripts:

- `npm run build`: compile TypeScript
- `npm run typecheck`: run TypeScript checks without emitting files
- `npm run start`: run the compiled server from `dist/`

Additional AI architecture notes are in `crime-platform/functions/ml_backend/docs/ai-architecture.md`.

## Deployment

Build the static frontend export and deploy the Catalyst project:

```powershell
cd crime-platform\frontend
npm run build

cd ..
catalyst deploy
```

## Notes

- `api_service` can use Zoho Catalyst Data Store when the required tables exist.
- The standalone local API runner reads from `db/seed.sql`, so it can be used without Catalyst project access.
- Keep database schema changes in `crime-platform/db/` and mirror required function-level data updates where applicable.

## Attribution

Developed by Axiom Crew for the Karnataka State Police Crime Intelligence Datathon.
