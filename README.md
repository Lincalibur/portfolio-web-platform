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
* **Automation hub:** Terminal-style demo of scripting skills.
* **Documentation vault:** Live view of architecture docs (including the SDD).

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

The API lives in [`src/Portfolio.Api/`](src/Portfolio.Api/). Open `PortfolioWebPlatform.sln` in **Visual Studio 2022** or **Rider**, or use the CLI — both work; the repo is already scaffolded to match [`Docs/solutionDesign.md`](Docs/solutionDesign.md).

### Prerequisites

* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet)
* [Node.js 20+](https://nodejs.org/) (for the SPA — coming in `src/Portfolio.Web`)

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

### Run frontend (once scaffold exists)

```powershell
cd src/Portfolio.Web
npm ci
npm run dev
```

---

## Deployment (Debian + Docker)

```bash
docker compose up -d --build
```

Use a `.env` file (from `.env.example`) for `Jwt__SigningKey`, `Smtp__*`, and database path. Prefer **Cloudflare Tunnel** instead of opening router ports. Details: [`Docs/solutionDesign.md`](Docs/solutionDesign.md).

---

## Project blueprint

Network routing, entity model, container layout, and security controls are documented in the **Solution Design Document**:

[`Docs/solutionDesign.md`](Docs/solutionDesign.md)
