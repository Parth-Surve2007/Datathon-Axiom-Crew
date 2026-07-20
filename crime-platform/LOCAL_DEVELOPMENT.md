# Local development

Run the API and frontend in separate terminals from `crime-platform`.

For teammates who do not have access to the linked Catalyst project, use the local API runner:

```powershell
Set-Location functions\api_service
npm.cmd run serve:local
```

If your Catalyst account has access to the linked project, you can also run the Catalyst function locally:

```powershell
catalyst.cmd serve --only functions:api_service --http 3001 --no-open
```

```powershell
Set-Location frontend
npm.cmd run dev
```

Open `http://localhost:3000/dashboard`.

The frontend polls `http://localhost:3001/server/api_service/intelligence` every 30 seconds. Set `NEXT_PUBLIC_CATALYST_API_URL` only if the local Catalyst URL changes; see `frontend/.env.local.example`.

The API uses Zoho Catalyst Data Store whenever the canonical tables exist. The local API runner always reads `db/seed.sql`, so it does not require Catalyst project access. Once the tables are created and populated in Catalyst, the Catalyst-served endpoint switches to Catalyst without frontend changes.
