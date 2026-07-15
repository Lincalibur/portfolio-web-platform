# Interactive Resume Ecosystem

A self-hosted interactive CV website designed for **low resource use** on a **Debian** server via **Docker**. It demonstrates full-stack engineering, DevOps, automation, and security without a heavy application framework.

---

## Core features

### Secure gatekeeper

* **Lead capture:** Corporate email and name before full access.
* **OTP verification:** Short-lived code sent via SMTP (MailKit).
* **Session management:** JWT after successful verification.
* **Follow-up:** In-process scheduled job (no extra worker container).

### Interactive story blocks

* **Gateway:** Email capture and token validation UI.
* **DevOps pipeline:** Interactive CI/CD visualization (YAML from this repo).
* **System orchestration:** Host/container metrics from a protected API.
* **Automation hub:** Terminal-style scripting demos with visual console effects.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| API | ASP.NET Core 9 Minimal API |
| Database | SQLite (EF Core), file on Docker volume |
| Frontend | Static SPA (Vite + React or Angular) behind nginx |
| Hosting | Docker Compose on Debian |
| Edge / TLS | Cloudflare Tunnel (recommended) |
| Auth | JWT + email OTP |

> **Note:** The previous ABP Framework + SQL Server approach was removed from the design due to operational weight. See [`Docs/solutionDesign.md`](Docs/solutionDesign.md) for the full architecture.

---

## Quick setup (local development)

See **[`Docs/howToRunGuide.md`](Docs/howToRunGuide.md)** for the full step-by-step guide (prerequisites, two-terminal workflow, OTP flow, env vars, and troubleshooting).

**Windows shortcut:** double-click **`start-dev.bat`** at the repo root to open the API and frontend in two PowerShell windows.

The API lives in [`src/Portfolio.Api/`](src/Portfolio.Api/). Open `PortfolioWebPlatform.slnx` in **Visual Studio 2022** or **Rider**, or use the CLI.

### Prerequisites

* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet)
* [Node.js 20+](https://nodejs.org/) (for the SPA in `src/Portfolio.Web`)

### Run API

```powershell
cd src/Portfolio.Api
dotnet run
```

* HTTPS: **https://localhost:7262**
* Health: `GET /health`
* Auth: `POST /api/auth/request-access`, `POST /api/auth/verify`

Migrations run automatically on startup. In **Development**, if SMTP is not configured, the OTP is written to the console log.

Optional manual migration:

```powershell
dotnet ef database update --project src/Portfolio.Api
```

### User secrets (recommended over editing JSON)

```powershell
cd src/Portfolio.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:SigningKey" "your-production-grade-secret-at-least-32-chars"
dotnet user-secrets set "Smtp:Host" "smtp.example.com"
```

### Run frontend

```powershell
cd src/Portfolio.Web
npm install
npm run dev
```

* Dev server: **http://localhost:5173**
* Landing: `/` (calls `GET /health`)
* Gateway: `/gateway` → OTP verify → JWT → `/story/*`

**Local API connection:** In development, leave `VITE_API_BASE_URL` empty in `.env.development`. Vite proxies `/health` and `/api` to `http://localhost:5180` so the browser is not blocked by the API’s self-signed HTTPS certificate. Start the API with the **https** launch profile (`dotnet run` — default), which listens on both `https://localhost:7262` and `http://localhost:5180`.

If the health check still fails, confirm the API is running and that `VITE_API_PROXY_TARGET` matches the API HTTP URL.

Optional flags in `.env.development`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_ENABLE_INTERACTION_METRICS` | `false` | POST to `/api/metrics/interaction` when `Features:InteractionMetrics` is on |
| `VITE_USE_HOST_STATS_API` | `false` | Use live `GET /api/host/stats` instead of `public/fixtures/host-stats.json` |

Run both API and SPA together for the full auth flow. In Development, OTP codes appear in the API console when SMTP is not configured.

---

## Deploy frontend on GitHub Pages

GitHub Pages can host the **static React SPA** only — not the ASP.NET API. The Pages build enables a **static demo** (mock OTP `000000`, fixture-backed story blocks). Admin / live metrics still need Docker or a local API.

### One-time setup on GitHub

1. Push these changes to `development` or `main`.
2. Open the repo → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Wait for the **Deploy GitHub Pages** workflow (`.github/workflows/deploy-github-pages.yml`) to succeed.

Site URL (project pages):

`https://<your-github-username>.github.io/portfolio-web-platform/`

Example for this repo: `https://lincalibur.github.io/portfolio-web-platform/`

### Try the demo on Pages

1. Open the site URL above.
2. **Enter the gateway** → submit name + email (validation / SQL-block UI still runs).
3. On verify, enter OTP **`000000`** (no email is sent).
4. Explore `/story/*` with baked-in fixtures.

### Preview the Pages build locally

```powershell
cd src/Portfolio.Web
$env:BASE_PATH="/portfolio-web-platform/"
$env:VITE_STATIC_DEMO="true"
npm run build
npm run preview
```

---

## Deployment (Debian + Docker)

Full stack (API + SPA + OTP + admin) still uses Docker on a host:

```bash
docker compose up -d --build
```

Use a `.env` file (from `.env.example`) for `Jwt__SigningKey`, `Smtp__*`, and database path. Prefer **Cloudflare Tunnel** instead of opening router ports. Details: [`Docs/solutionDesign.md`](Docs/solutionDesign.md).

---

## Project blueprint

| Document | Purpose |
| --- | --- |
| [`Docs/howToRunGuide.md`](Docs/howToRunGuide.md) | **Local setup** + **GitHub Pages** static demo |
| [`Docs/solutionDesign.md`](Docs/solutionDesign.md) | Architecture, security, Docker layout |
| [`Docs/implementationPlan.md`](Docs/implementationPlan.md) | **Feature-by-feature** build plan (F0–F9), gated endpoints, fixture-based UI testing |
| [`Docs/Postman/`](Docs/Postman/) | Postman collection + local environment (keep in sync with API changes) |
| [`src/Portfolio.Api/Portfolio.Api.http`](src/Portfolio.Api/Portfolio.Api.http) | Runnable HTTP samples (Visual Studio / REST Client) |
