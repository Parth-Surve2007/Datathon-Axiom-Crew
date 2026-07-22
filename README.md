# Kangavalu (ಕಂಗಾವಲು) — KSP Crime Intelligence Command Workspace

> **A unified operational workspace for connected crime intelligence, investigations, and emerging patterns across Karnataka.**

---

## 🌟 Overview & Platform Vision

**Kangavalu** is an advanced operational intelligence platform designed for the **Karnataka State Police (KSP)**. It synthesizes multi-district FIR records, suspect networks, geospatial hotspots, and telemetry into a single, real-time command dashboard.

Built with high-performance web technologies and cloud serverless architecture, Kangavalu empowers crime analysts, investigating officers, and command staff to track active incidents, query intelligence via AI, and visualize criminal syndicates.

---

## ✨ Key Features & Modules

### 1. 📊 Live Command Overview (`/app/dashboard`)
- **Incident Pulse**: Interactive real-time timeline visualizing daily registered incidents across district control rooms.
- **Priority Queue**: Dynamic case feed highlighting high-risk and heinous cases with instant case details.
- **Field Unit Telemetry**: Live status of active investigating officers and field deployment units.
- **Case Pipeline Metrics**: Real-time aggregated counters for registered FIRs, active investigations, charge-sheeted cases, and closures.

### 2. 💬 Intelligence Assistant (`/app/chat`)
- **AI Crime Intelligence Terminal**: Interactive assistant for natural language querying of FIR datasets, suspect cross-referencing, and criminal history lookup.

### 3. 📈 Analytics Telemetry (`/app/analytics`)
- **Visual Analytics**: Interactive Recharts telemetry displaying crime category breakdowns, district distribution, and incident trend velocity over custom time windows.

### 4. 🗺️ Geospatial Uplink (`/app/map`)
- **Crime Hotspot Mapping**: Spatial visualization of high-risk nodes, hotspot clusters, and district-level crime density across Karnataka.

### 5. 🕸️ Syndicate Nexus (`/app/network`)
- **Network Graph Visualization**: Entity graph mapping connections between suspects, cases, assets, locations, and criminal syndicates.

### 6. 📁 Case Reports & Documentation (`/app/reports`)
- Structured incident reporting, case export, and investigative file management.

---

## 🏗️ Architecture & Technology Stack

### Frontend Stack (`crime-platform/frontend/`)
- **Framework**: Next.js 15 (App Router with `output: "export"`, `basePath: "/app"`, and `trailingSlash: true`)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Design System (Glassmorphism, obsidian palette `#050505`, custom gradients)
- **Animations**: Framer Motion for spring transitions, active nav layout animations, and fluid counters
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend & Serverless Stack (`crime-platform/backend/` & `crime-platform/functions/`)
- **Serverless Compute**: Zoho Catalyst Serverless Functions (`functions/api_service`)
- **API Framework**: Express.js with TypeScript
- **Database**: Zoho Catalyst Data Store / PostgreSQL (with local fallback seed `db/seed.sql`)
- **Logging & Security**: Helmet, CORS policies, Pino structured logger, rate limiting

---

## 🗂️ Repository Structure

```
datathon/
├── README.md
└── crime-platform/
    ├── .catalystrc                  # Catalyst project configuration
    ├── catalyst.json                # Catalyst deployment targets (client & functions)
    ├── LOCAL_DEVELOPMENT.md         # Local setup instructions
    ├── db/                          # Database schemas and seed data
    │   └── seed.sql                 # Canonical seed dataset
    ├── backend/                     # Modular Express API service
    │   └── src/                     # Controllers, middleware, services, and types
    ├── functions/                   # Catalyst Serverless Functions
    │   └── api_service/             # Express API function endpoint
    │       ├── index.js             # Catalyst entry point
    │       ├── local-server.js      # Standalone local development server
    │       └── services/            # Intelligence data services
    └── frontend/                    # Next.js App Router frontend
        ├── public/                  # Static assets (KSP emblem, logos, OG images)
        ├── src/
        │   ├── app/                 # Next.js pages (dashboard, chat, analytics, map, network, login)
        │   ├── components/          # Reusable UI components (Sidebar, LiveDataState, MotionProvider)
        │   ├── hooks/               # Custom React hooks (useLiveIntelligence)
        │   └── lib/                 # Utility functions & API client configuration
        ├── next.config.ts           # Next.js configuration (basePath: /app, output: export)
        └── .env.local               # Environment variables
```

---

## 🌐 Dynamic API & Environment Architecture

Kangavalu features **automatic environment resolution** for API endpoints:

- **Local Development (`localhost`)**: The frontend automatically routes API requests to `http://localhost:3001/server/api_service`.
- **Cloud Deployment (`*.catalystserverless.in`)**: When hosted on Zoho Catalyst, the frontend automatically routes API requests to the relative server path `/server/api_service`.

If the local backend service is offline during local runs, the frontend cleanly presents a non-blocking **"Catalyst is not reachable"** indicator with a manual retry control.

---

## 🚀 Running Locally

### 1. Start Backend Service (Port 3001)

#### Option A: Catalyst CLI Serve (Requires Catalyst Project Access)
```powershell
# From crime-platform root directory:
catalyst serve --only functions:api_service --http 3001 --no-open
```

#### Option B: Standalone Local API Runner (No Catalyst Access Needed)
```powershell
# From crime-platform/functions/api_service:
npm run serve:local
```

> 📍 **API Endpoint**: `http://localhost:3001/server/api_service`  
> 🏥 **Health Check**: `http://localhost:3001/server/api_service/health`

---

### 2. Start Frontend Dev Server (Port 3000)

```powershell
# Navigate to frontend directory:
cd crime-platform/frontend

# Start Next.js dev server:
npm run dev
```

> 🌐 **App Workspace URL**: **`http://localhost:3000/app`** (or `http://localhost:3000/app/dashboard`)

---

## 🚢 Deploying to Zoho Catalyst

To build and deploy the complete platform (static client + serverless functions) to Zoho Catalyst:

```powershell
# Navigate to crime-platform:
cd crime-platform

# Build frontend static export:
cd frontend
npm run build
cd ..

# Deploy to Catalyst Cloud:
catalyst deploy
```

---

## 🛡️ License & Attributions

Developed for the Karnataka State Police (KSP) Crime Intelligence Datathon. All rights reserved.
