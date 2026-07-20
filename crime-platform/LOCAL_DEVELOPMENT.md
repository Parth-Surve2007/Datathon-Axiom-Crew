# Local development

Run the API and frontend in separate terminals from `crime-platform`:

```powershell
catalyst.cmd serve --only functions:api_service --http 3001 --no-open
```

```powershell
Set-Location frontend
npm.cmd run dev
```

Open `http://localhost:3000/dashboard`.

The frontend polls `http://localhost:3001/server/api_service/intelligence` every 30 seconds. Set `NEXT_PUBLIC_CATALYST_API_URL` only if the local Catalyst URL changes; see `frontend/.env.local.example`.

The API uses Zoho Catalyst Data Store whenever the canonical tables exist. The currently configured Development project has no Data Store tables, so local development automatically reads `db/seed.sql`. Once those tables are created and populated in Catalyst, the same endpoint switches to Catalyst without frontend changes.

