# Solution Design Document: Project "Interactive Resume Ecosystem"

## 1. System Architecture Overview

The system uses a **thin, container-friendly stack** optimized for a single Debian host with modest CPU and RAM. There is no application framework layer (no ABP, no OpenIddict, no multi-project DDD solution). One small API process, one static frontend, and an embedded database file keep the footprint low while preserving the gatekeeper and story experience.

```
[ Visitor Browser ]
        │
        ▼ (HTTPS — terminated at edge)
[ Cloudflare ] ──(Tunnel or reverse proxy)──► [ Debian Server (Docker Compose) ]
                                                      │
              ┌───────────────────────────────────────┼───────────────────────────────────────┐
              ▼                                       ▼                                       ▼
   [ nginx:alpine ]                         [ API: ASP.NET Core ]                    [ SQLite volume ]
   Static SPA + rate limits                Minimal API + JWT + MailKit              /data/resume.db
   (built assets only)                     EF Core (SQLite provider)
```

### Design principles

| Goal | Approach |
| --- | --- |
| Low resource use | SQLite (no separate DB container), Alpine-based images where possible, single API project |
| Simple operations | `docker compose up -d` — three services or two if API serves health only and nginx serves UI |
| Security | Edge TLS, outbound-only tunnel, JWT, rate limits, secrets via env — not committed to git |
| Portability | Same Compose file for Debian production; API runs locally with `dotnet run` and SQLite file for dev |

### Infrastructure components (Debian server)

* **Reverse proxy / static host:** `nginx:alpine` in Docker — serves the built SPA, applies security headers, request size limits, and per-route rate limiting for `/api/auth/*`.
* **API:** `mcr.microsoft.com/dotnet/aspnet` (slim) — one **ASP.NET Core 9 Minimal API** project with EF Core and SQLite.
* **Database:** **SQLite** on a named Docker volume (`/data/resume.db`). No SQL Server container; avoids hundreds of MB of RAM and licensing complexity. For local Windows dev, use the same SQLite file path under `App_Data/`.
* **Outbound email:** SMTP (SendGrid, Mailgun, or provider relay) via **MailKit**; credentials in environment variables only.
* **Optional edge:** **Cloudflare Tunnel** (`cloudflared`) container or host service — recommended so no inbound ports are opened on the home router.

### Container layout (Docker Compose)

| Service | Image / build | Role | Typical RAM |
| --- | --- | --- | --- |
| `web` | `nginx:alpine` + copied `dist/` | SPA, TLS headers, rate limit zones | ~10 MB |
| `api` | Multi-stage Dockerfile → `aspnet` runtime | Auth, tokens, metrics, host stats proxy | ~80–120 MB |
| `tunnel` | `cloudflare/cloudflared` (optional) | Outbound-only public access | ~20 MB |

SQLite lives inside the `api` container on a volume mount, or on a shared volume if you prefer backup snapshots without rebuilding the image.

---

## 2. Gatekeeper & Security Layer (Auth Flow)

Visitors authenticate before the full interactive CV. Logic lives in the API; the SPA only stores the JWT in memory or `sessionStorage` (prefer memory + short TTL where possible).

### Verification workflow

1. **Landing (Gateway block):** User submits **company email** and **full name**.
2. **Validation:** API validates format, normalizes email, applies rate limit (per IP and per email).
3. **Token:** API generates a cryptographically random 6-digit code (or short OTP) with **10–15 minute** expiry; stores hash (not plaintext) in SQLite with status `Pending`.
4. **Email:** MailKit sends the code via SMTP; failures are logged without leaking provider details to the client.
5. **Verify:** User submits code; API verifies hash, marks lead `Verified`, issues **JWT** (e.g. 7-day access, scoped claim `resume:read`).
6. **Follow-up:** A lightweight **`IHostedService`** or Hangfire **in-process** job (SQLite storage) queues a delayed email — no separate worker container required.

### API surface (illustrative)

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/request-access` | Public (rate limited) | Create lead, send OTP |
| `POST` | `/api/auth/verify` | Public (rate limited) | Validate OTP, return JWT |
| `GET` | `/api/metrics/interaction` | JWT | Anonymous interaction beacons from story blocks |
| `GET` | `/api/host/stats` | JWT | Cached CPU/RAM/Docker summary for orchestration block |

---

## 3. Core Application Architecture (Lean Backend)

Single solution folder, e.g. `src/Portfolio.Api/`, with clear layers kept **in one deployable assembly** (folders/namespaces only — not separate NuGet modules).

### Project structure

```
src/Portfolio.Api/
├── Program.cs                 # Minimal API endpoints, DI, middleware
├── Data/
│   ├── AppDbContext.cs
│   └── Migrations/            # EF Core migrations for SQLite
├── Entities/
│   ├── VisitorLead.cs
│   └── InteractionLog.cs
├── Services/
│   ├── ILeadService.cs        # Request access, verify OTP
│   ├── ITokenService.cs       # JWT issue/validate
│   ├── IEmailService.cs       # MailKit SMTP
│   └── IHostStatsService.cs   # Read /proc or docker.sock (read-only)
└── appsettings.json           # Non-secret defaults only
```

### Entity model (EF Core)

* **`VisitorLead`:** `Id`, `FullName`, `Email`, `Company` (optional), `OtpHash`, `OtpExpiresAt`, `IsVerified`, `CreatedAt`, `VerifiedAt`.
* **`InteractionLog`:** `Id`, `LeadId` (nullable), `BlockId`, `EventType`, `PayloadJson`, `CreatedAt`.

### Security middleware (ASP.NET Core)

* **HTTPS redirection** behind proxy: `ForwardedHeaders` configured for Cloudflare/nginx.
* **JWT bearer** authentication for protected routes.
* **`Microsoft.AspNetCore.RateLimiting`** — fixed window on auth endpoints.
* **ProblemDetails** for errors; no stack traces in production.
* **CORS** — allow only the SPA origin in production.

### Secrets and configuration

| Setting | Source |
| --- | --- |
| `ConnectionStrings__Default` | `Data Source=/data/resume.db` (Compose) |
| `Jwt__SigningKey` | Docker secret or `.env` (min 32 bytes) |
| `Smtp__*` | Environment variables |
| `Cloudflare__*` | Tunnel token via env |

Never commit `appsettings.secrets.json`, `.env`, or signing keys (see `.gitignore`).

---

## 4. Frontend (Interactive Story)

A **static SPA** (recommended: **Vite + React** or **Angular** standalone build) compiled to `dist/` and copied into the nginx image. No server-side rendering requirement — keeps the `web` container minimal.

### Story blocks (unchanged intent)

| Block | Narrative | Interactive element | Skills proven |
| --- | --- | --- | --- |
| **01. Gateway** | Securing the perimeter | Email + OTP UI → Minimal API | Security, UX, API integration |
| **02. Pipeline** | How this code shipped | CI/CD graph; YAML snippets from repo | Git, YAML, DevOps |
| **03. Orchestration** | Living on the edge | Dashboard from `/api/host/stats` | Linux, Docker, scripting |
| **04. Automation hub** | Scripts at work | Terminal UI; optional call to sandboxed demo endpoint | Python/logic (demo or wasm) |
| **05. Documentation vault** | The blueprint | Embedded Markdown (this SDD, README) | Technical writing |

The SPA calls the API with `Authorization: Bearer` after verify. Public assets (landing shell) can load without JWT; story routes use a router guard.

---

## 5. Security & Hardening Strategy

Hosting on a home or small VPS Debian machine requires defense in depth without heavy appliances.

* **Network isolation:** Guest VLAN or dedicated subnet; only the Debian host participates in the tunnel.
* **Cloudflare Tunnel (recommended):** Outbound-only `cloudflared`; no port forwarding on the router. Combine with Cloudflare WAF/rate rules at the edge.
* **Rate limiting:** nginx `limit_req` on `/api/auth/` **and** ASP.NET rate limiter as a second layer.
* **fail2ban:** Host-level jail on nginx/API access logs for repeated 401/429 on auth paths.
* **Container hardening:** Non-root user in API Dockerfile, read-only root filesystem where practical, no `docker.sock` mount unless the orchestration block needs it — prefer a small read-only stats script invoked by the API.
* **OTP storage:** Store **HMAC/hash** of OTP, never plaintext; single-use and short TTL.
* **Dependencies:** Pin image digests in Compose for production; rebuild on security patches.

---

## 6. Docker & Debian Deployment

### Production Compose (conceptual)

* **`web`:** Build stage runs `npm ci && npm run build`; runtime image is nginx + `dist/`.
* **`api`:** Build stage `dotnet publish -c Release`; runtime `aspnet` + SQLite volume at `/data`.
* **Health checks:** `GET /health` on API; nginx `/` for static.
* **Logging:** JSON logs to stdout for Docker; rotate on host via journald or log driver.

### Debian host prerequisites

* Docker Engine + Compose plugin (Debian bookworm/trixie packages).
* Optional: `fail2ban`, unattended-upgrades for the OS.
* DNS managed in Cloudflare; tunnel hostname points to internal `web:80` or `api:8080` via Compose network.

### Resource budget (realistic)

| Component | Approximate RAM |
| --- | --- |
| nginx + SPA | 10–30 MB |
| ASP.NET Core API | 80–150 MB |
| cloudflared (optional) | 20–40 MB |
| **Total** | **~150–250 MB** excluding OS |

Compare to ABP + SQL Server, which often exceeds **1 GB** before the frontend container.

---

## 7. Implementation Roadmap

Detailed **feature-by-feature** delivery (one PR per feature, feature-flagged endpoints, frontend fixtures instead of bulk mock APIs) lives in [`implementationPlan.md`](implementationPlan.md).

### Phase 1: Scaffold & local dev (Week 1)

* Create `src/Portfolio.Api` — Minimal API, EF Core SQLite, initial migration for `VisitorLead` / `InteractionLog`.
* Add `src/Portfolio.Web` — Vite SPA with gateway page and JWT storage.
* Document env vars in README (no new markdown files per change).

### Phase 2: Auth & email (Week 2)

* Implement request-access and verify endpoints with OTP hashing and JWT.
* Integrate MailKit + SMTP; test with provider sandbox.
* Add rate limiting and ProblemDetails.

### Phase 3: Story blocks & metrics (Weeks 3–4)

* Build pipeline, vault, and orchestration UI components.
* Wire interaction logging and host stats endpoint (cached, JWT-protected).

### Phase 4: Docker & Debian (Week 5)

* Add multi-stage `Dockerfile` for API and web.
* Add `docker-compose.yml` with volumes, env file template (`.env.example` only).
* Deploy on Debian; configure Cloudflare Tunnel and fail2ban.
* Embed this document in the Documentation Vault block.

---

## 8. Technology summary

| Layer | Choice | Rationale |
| --- | --- | --- |
| API | ASP.NET Core 9 Minimal API | Familiar .NET stack without ABP ceremony |
| ORM | EF Core + SQLite | Single file DB, minimal ops, sufficient for lead volume |
| Auth | JWT + OTP email | Simple, stateless sessions after verify |
| Email | MailKit | Lightweight, well-supported |
| Frontend | Static SPA (Vite + React or Angular) | Served by nginx; small image |
| Hosting | Docker Compose on Debian | Reproducible, isolated, low RAM |
| Edge | Cloudflare Tunnel + HTTPS | No open inbound ports; TLS at edge |

This design preserves the interactive resume vision while remaining **secure, operable, and small enough for a spare laptop or low-tier VPS**.
