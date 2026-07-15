# How to Run — Interactive Resume Ecosystem

Step-by-step guide for running the project locally on Windows (PowerShell) or Linux/macOS. For architecture and feature delivery, see [`solutionDesign.md`](solutionDesign.md) and [`implementationPlan.md`](implementationPlan.md).

---

## 1. Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet) | 9.x | API (`src/Portfolio.Api`) |
| [Node.js](https://nodejs.org/) | 20+ | Frontend (`src/Portfolio.Web`) |
| Git | Any recent | Clone the repository |

Optional:

* **Visual Studio 2022** or **Rider** — open `PortfolioWebPlatform.slnx` / `src/Portfolio.Api`
* **Postman** — [`Docs/Postman/`](Postman/) collection for API testing

Verify installations:

```powershell
dotnet --version
node --version
npm --version
```

---

## 2. Repository layout

```text
portfolio-web-platform/
├── src/
│   ├── Portfolio.Api/     # ASP.NET Core 9 Minimal API + SQLite
│   └── Portfolio.Web/     # Vite + React SPA
├── Docs/                  # Architecture, plans, this guide
└── .env.example           # Template for production Docker env (do not commit .env)
```

---

## 3. Run locally (recommended workflow)

You need **two terminals**: one for the API, one for the frontend.

### Option A — Double-click (Windows)

From the repository root:

| File | Action |
| --- | --- |
| **`start-dev.bat`** | Opens **two PowerShell windows** — API first, then frontend (recommended) |
| `start-api.bat` | API only (cmd window) |
| `start-web.bat` | Frontend only (cmd window) |

Wait until the API window shows **Now listening on**, then open **http://localhost:5173**.

First-time frontend setup: run `npm install` once inside `src/Portfolio.Web` before using the batch files.

### Option B — Manual terminals

#### Step 1 — Start the API

```powershell
cd src/Portfolio.Api
dotnet run
```

Default launch profile is **https**, which listens on:

| URL | Use |
| --- | --- |
| `https://localhost:7262` | Direct API access (Postman, `Portfolio.Api.http`) |
| `http://localhost:5180` | Used by the Vite dev proxy (frontend) |

On first run, EF Core applies SQLite migrations automatically. The database file is created at `src/Portfolio.Api/App_Data/resume.dev.db`.

Confirm the API is up:

```powershell
Invoke-RestMethod http://localhost:5180/health
```

Expected response: `{ "status": "healthy" }`

Wait until the console shows **Now listening on** before starting the frontend.

### Step 2 — Start the frontend

Open a **new** terminal:

```powershell
cd src/Portfolio.Web
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

The landing page health indicator should show **API status: healthy**. If it does not, see [Troubleshooting](#7-troubleshooting).

### Step 3 — Walk through the app

| Step | Route | What happens |
| --- | --- | --- |
| 1 | `/` | Landing page; health check via proxy |
| 2 | `/gateway` | Submit name + email → `POST /api/auth/request-access` |
| 3 | API console | OTP printed when SMTP is not configured (see below) |
| 4 | `/gateway/verify` | Enter 6-digit code → JWT issued |
| 5 | `/story` | Profile overview + story blocks (Pipeline, Orchestration, Automation, Docs) |

After verification, the session JWT is stored in `sessionStorage`. Use **Sign out** in the story shell to clear it.

---

## 4. Configuration

### 4.1 Frontend — `src/Portfolio.Web/.env.development`

| Variable | Local default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | *(empty)* | Leave empty in dev; Vite proxies `/health` and `/api` |
| `VITE_API_PROXY_TARGET` | `http://localhost:5180` | Where the proxy forwards API requests |
| `VITE_ENABLE_INTERACTION_METRICS` | `false` | Set `true` only when API feature flag enables metrics |
| `VITE_USE_HOST_STATS_API` | `false` | Set `true` to call live `/api/host/stats` instead of fixtures |

**Why the proxy?** Browsers block `fetch` to `https://localhost:7262` because of the dev self-signed certificate. Proxying through Vite on `http://localhost:5173` avoids that.

After changing `.env.development`, **restart** `npm run dev`.

### 4.2 API — `appsettings.Development.json`

CORS allows `http://localhost:5173` and `https://localhost:5173`. JWT signing key is set for local dev only — replace before any real deployment.

### 4.3 User secrets (recommended for SMTP and production keys)

```powershell
cd src/Portfolio.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:SigningKey" "your-production-grade-secret-at-least-32-chars"
dotnet user-secrets set "Smtp:Host" "smtp.example.com"
dotnet user-secrets set "Smtp:Port" "587"
dotnet user-secrets set "Smtp:UserName" "your-user"
dotnet user-secrets set "Smtp:Password" "your-password"
dotnet user-secrets set "Smtp:FromAddress" "noreply@yourdomain.com"
dotnet user-secrets set "Smtp:FromDisplayName" "Portfolio Resume"
```

### 4.4 OTP without SMTP

If `Smtp:Host` is not set, the API **does not email** the code. Instead, it logs something like:

```text
SMTP not configured. OTP for user@example.com (Name): 123456 (development only)
```

Watch the **API terminal** for the 6-digit code after submitting the gateway form.

### 4.5 Admin portal (traffic & security reporting)

Admin credentials are **never** committed. Configure them locally with **user secrets** or environment variables.

**Option A — setup script (recommended on Windows):**

```powershell
# From repository root — choose your own username and password
.\scripts\setup-admin.ps1 -Username "your-username" -Password "your-strong-password"
```

This stores credentials in **dotnet user secrets** and also writes `src/Portfolio.Api/appsettings.secrets.json` (gitignored) as a local backup. Restart the API after running the script.

**Option B — manual user secrets:**

```powershell
cd src/Portfolio.Api
dotnet user-secrets init
dotnet user-secrets set "Admin:Username" "your-username"
# Generate a hash (do not store plaintext passwords in config):
dotnet run -- hash-admin-password "your-strong-password"
dotnet user-secrets set "Admin:PasswordHash" "<paste-hash-output>"
```

**Option C — `appsettings.secrets.json` (gitignored):**

Copy `src/Portfolio.Api/appsettings.secrets.json.example` to `appsettings.secrets.json`, fill in `Username` and `PasswordHash` only (never plaintext passwords).

| Route | Purpose |
| --- | --- |
| http://localhost:5173/admin/login | Admin sign-in |
| http://localhost:5173/admin | Ops dashboard (incidents + traffic summary) |
| `GET /api/ops/report` | JSON report (requires Admin JWT) |

Traffic logging behaviour is described in [`trafficLoggingImplementation.md`](trafficLoggingImplementation.md). Suspicious directory probes (e.g. `/.env`, `/wp-admin`) are logged as security incidents; normal page views increment ephemeral counters only. Logs older than `TrafficLogging:RetentionDays` (default 7) are purged nightly.

---

## 5. Build for production (frontend only)

```powershell
cd src/Portfolio.Web
npm run build
```

Output is written to `src/Portfolio.Web/dist/`. In production, nginx (or similar) serves `dist/` and proxies `/api` to the API container. Set `VITE_API_BASE_URL` in `.env.production` to your public API origin if the SPA and API are on different hosts.

---

## 6. Test the API directly

### PowerShell

```powershell
$base = "http://localhost:5180"

# Health
Invoke-RestMethod "$base/health"

# Request access
Invoke-RestMethod "$base/api/auth/request-access" -Method POST -ContentType "application/json" `
  -Body '{"fullName":"Test User","email":"test@example.com","company":"Test Co"}'

# Verify (replace code from API console)
$auth = Invoke-RestMethod "$base/api/auth/verify" -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","code":"123456"}'
$token = $auth.accessToken
```

### Other tools

| Tool | Location |
| --- | --- |
| Postman | [`Docs/Postman/Portfolio.Api.postman_collection.json`](Postman/Portfolio.Api.postman_collection.json) |
| HTTP file | [`src/Portfolio.Api/Portfolio.Api.http`](../src/Portfolio.Api/Portfolio.Api.http) |

---

## 7. Troubleshooting

### Landing page: “Unable to reach the API”

1. Confirm API is running and shows `Now listening on http://localhost:5180`.
2. Test: `Invoke-RestMethod http://localhost:5180/health`
3. Restart Vite after any `.env.development` change.
4. Confirm `VITE_API_PROXY_TARGET=http://localhost:5180` in `.env.development`.

### Gateway: network error on submit

* API not running, or wrong proxy target.
* Check browser DevTools → Network for failed `/api/auth/*` requests.

### Verify: invalid code

* OTP expires after ~15 minutes; request a new code from `/gateway`.
* Use the latest code from the **API console** (not an old one).
* Email must match what you submitted (case-insensitive).

### Verify: does not redirect to `/story`

* Restart the frontend after pulling latest changes.
* Clear site data for `localhost:5173` and try again.

### CORS errors

* Frontend must be on `http://localhost:5173` (or an origin listed in `Cors:AllowedOrigins` in API config).
* Do not open `dist/index.html` as a `file://` URL for API calls.

### Port already in use

* API: change ports in `src/Portfolio.Api/Properties/launchSettings.json` and update `VITE_API_PROXY_TARGET` to match the HTTP port.
* Frontend: Vite uses `5173` by default; override in `vite.config.ts` if needed.

---

## 8. GitHub Pages (static SPA demo)

GitHub Pages **cannot run** `Portfolio.Api`. The workflow [`.github/workflows/deploy-github-pages.yml`](../.github/workflows/deploy-github-pages.yml) builds only `src/Portfolio.Web` with:

| Variable | Value | Purpose |
| --- | --- | --- |
| `BASE_PATH` | `/<repo-name>/` | Asset + router base for project Pages |
| `VITE_STATIC_DEMO` | `true` | Mock auth / health; skip live API calls |
| `VITE_ENABLE_INTERACTION_METRICS` | `false` | No metrics POSTs |
| `VITE_USE_HOST_STATS_API` | `false` | Use `fixtures/host-stats.json` |

### Enable Pages once

1. Merge SPA changes into **`main`** (or run **Actions** → **Deploy GitHub Pages** → **Run workflow** on `main`). Feature / `development` pushes do **not** publish. The workflow builds the SPA and pushes it to the `gh-pages` branch.
2. Repo → **Settings** → **Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / `/` (root) → **Save**
3. Do **not** use `main`/`development` as the Pages branch — that publishes the README, not the Vite app.
4. Open `https://<owner>.github.io/<repo>/` (e.g. `https://lincalibur.github.io/portfolio-web-platform/`).

### Demo OTP on Pages

Use code **`000000`** after submitting the gateway form. Admin login and live host/traffic APIs are unavailable in this mode.

### Local static preview (same as Pages)

```powershell
cd src/Portfolio.Web
$env:BASE_PATH="/portfolio-web-platform/"
$env:VITE_STATIC_DEMO="true"
$env:VITE_ENABLE_INTERACTION_METRICS="false"
$env:VITE_USE_HOST_STATS_API="false"
npm run build
npm run preview
```

---

## 9. Production deployment (overview)

Full Docker/nginx/Cloudflare steps are in [`solutionDesign.md`](solutionDesign.md). Summary:

1. Copy `.env.example` to `.env` and set `Jwt__SigningKey`, `Smtp__*`, and database path.
2. Build and run with Docker Compose (when `docker-compose.yml` is added in F9).
3. Enable feature flags only for shipped UI blocks (`Features:HostStats`, `Features:InteractionMetrics`).
4. Prefer **Cloudflare Tunnel** over opening router ports.

---

## 10. Quick reference

| What | Command / URL |
| --- | --- |
| Run both (Windows) | Double-click `start-dev.bat` at repo root |
| Run API | `start-api.bat` or `cd src/Portfolio.Api` → `dotnet run` |
| Run SPA | `start-web.bat` or `cd src/Portfolio.Web` → `npm run dev` |
| App URL | http://localhost:5173 |
| API health | http://localhost:5180/health |
| Gateway | http://localhost:5173/gateway |
| Story (after auth) | http://localhost:5173/story |
| Admin portal | http://localhost:5173/admin/login |
| GitHub Pages demo | `https://<owner>.github.io/<repo>/` (OTP `000000`) |
| Pages workflow | `.github/workflows/deploy-github-pages.yml` |

---

## 11. Related documents

| Document | Purpose |
| --- | --- |
| [`solutionDesign.md`](solutionDesign.md) | Architecture and security |
| [`implementationPlan.md`](implementationPlan.md) | Feature delivery plan (F0–F9) |
| [`Postman/README.md`](Postman/README.md) | API manual testing |
| [`trafficLoggingImplementation.md`](trafficLoggingImplementation.md) | Traffic logging & admin ops dashboard |
| [`../README.md`](../README.md) | Project overview |
