# Datathon-Axiom-Crew
- for now added basic frontend
- did setup backend structre with DB and everything
- backend setup is yet to be done, api connections are yet to be made
- postgre/catalyst store is both supported but yet to be setup

---

## 📋 Development Log — Axiom Crew

### Session 1 — Platform Foundation

#### 🎨 Frontend (`crime-platform/frontend/`)
Built on **Next.js 16 + TypeScript + Tailwind CSS + Framer Motion**

**Pages created:**
- `/login` — Dark tactical auth screen with animated mesh gradients & KSP logo
- `/dashboard` — Tactical overview with animated stat cards, incident stream, Krime Engine AI panel
- `/chat` — AI terminal interface (Krime Intelligence Terminal) with message animations & data cards
- `/analytics` — Crime data telemetry with Recharts bar & area charts (teal/cyan palette)
- `/map` — Geospatial uplink placeholder (structured for Leaflet/Mapbox integration)
- `/network` — Syndicate nexus graph placeholder (structured for Cytoscape.js)

**Components:**
- `Sidebar.tsx` — Floating glassmorphic left nav bar (expands on hover, animated active indicator)
- `Watermark.tsx` — Faint full-screen KSP emblem background watermark
- `layout.tsx` — Immersive dark layout with ambient radial gradients & Framer Motion page transitions

**Design System:**
- Color palette: Obsidian black (`#050505`) base, teal-400/cyan-500 gradients for accents
- No standard purple/blue — uses grayish-turquoise scheme throughout
- Glassmorphism panels with `backdrop-blur`, gradient borders, and neon glow shadows
- All text uses `bg-clip-text` gradient or slate tones — zero generic colors
- Custom scrollbar, smooth page transitions with blur animation

**Platform branding:**
- Named **KrimeAI** throughout
- KSP emblem used as logo in sidebar and login
- Tab title & favicon set to KrimeAI / KSP logo
- Next.js dev toolbar disabled (`devIndicators: false`)

---

#### ⚙️ Backend (`crime-platform/backend/`)
Built on **Node.js + TypeScript + Express**

**Foundation complete (zero TypeScript errors):**

| Module | Details |
|--------|---------|
| `config/index.ts` | Zod-validated env — fails fast on bad config |
| `config/logger.ts` | Pino structured logger, redacts sensitive fields |
| `constants/` | HTTP codes, error codes, domain enums (roles, FIR status, crime types, graph types) |
| `types/` | Express augment, API envelope, result monad (`ok`/`fail`) |
| `utils/errors.ts` | Typed error hierarchy — `ValidationError`, `NotFoundError`, `UnauthorizedError` etc. |
| `utils/response.ts` | `sendSuccess()` / `sendError()` — uniform JSON envelope |
| `middleware/` | requestId, requestLogger, errorHandler, rateLimit, validate (Zod) |
| `controllers/health.ts` | `/health` + `/health/ready` with system metrics |
| `routes/` | Root router + versioned `/api/v1/` |
| `analytics/` | `CrimeTrendService` stub |
| `graph/` | `GraphService` stub (typed node/edge interfaces) |
| `chat/` | `ChatService` stub (Gemini API ready) |
| `reports/` | `ReportService` stub |
| `storage/` | `StorageService` stub (Catalyst File Store) |

**Security stack:** Helmet, CORS whitelist, rate limiting (100 req/15min default, 10/15min auth), Pino log redaction

---

#### 🗂️ Project Structure
```
datathon/
└── crime-platform/
    ├── frontend/       ← Next.js app (renamed from client)
    ├── backend/        ← Express API service
    └── functions/      ← Zoho Catalyst serverless functions (placeholder)
```

---

## 🚀 Running Locally

### Backend — Catalyst API Service (Port 3001)

Run this from the repo root to open a new CMD window with the Catalyst service:

```cmd
start cmd /k "cd /d crime-platform\backend && catalyst serve --only functions:api_service --http 3001 --no-open"
```

> The Express API will be available at **http://localhost:3001**
> Health check: **http://localhost:3001/health**

### Frontend — Next.js Dev Server

Run this from the repo root to open a second CMD window with the dev server:

```cmd
start cmd /k "cd /d crime-platform\frontend && npm run dev"
```

> The app will be available at **http://localhost:3000/app**

---

### ⏳ What's Pending (Phase 2)
- [ ] Database connection (Catalyst Data Store / PostgreSQL via pg)
- [ ] JWT auth middleware + `/auth/login` route
- [ ] FIR CRUD APIs
- [ ] Chat route + Gemini API integration (RAG over crime data)
- [ ] Analytics aggregation queries
- [ ] Graph payload builder (FIR → Cytoscape nodes/edges)
- [ ] Leaflet/Mapbox crime map integration
- [ ] Catalyst deployment config
