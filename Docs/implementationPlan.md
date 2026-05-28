# Implementation Plan: Interactive Resume Ecosystem

Execution guide for building **one functional feature at a time**. Each feature ships only the API routes it needs, consumed by UI in the **same step** — no large `/api/mock/*` surface and no dormant public endpoints.

Complements [`solutionDesign.md`](solutionDesign.md).

---

## 1. Security rules (read first)

| Rule | Why |
| --- | --- |
| **No endpoint without a consumer** | Every route is registered in the same PR that adds the frontend (or health/deploy tooling) that calls it. |
| **No global mock API** | Do not add a shared `/api/mock` tree. It is easy to leave enabled and gives unauthenticated fake auth/metrics. |
| **Prefer frontend fixtures** | Pipeline, docs, and automation demos use static JSON/Markdown under `Portfolio.Web/public/` until a real backend is required. |
| **JWT on all story data** | Host stats and interaction logging stay `[Authorize]`; never add public equivalents for “easier testing.” |
| **Feature flags for optional routes** | Routes not yet used by a shipped feature are behind `Features:*` in config (default `false` in Production). |
| **Auth is the only public write API** | `POST /api/auth/*` only; rate-limited. Everything else is `GET /health`, `GET /`, or authenticated. |
| **Remove or flag stragglers** | If a route is deferred, unmap it or set `Features:EnableX = false` so scanners and attackers cannot probe it. |

### API surface at a glance

| Route | Feature that owns it | Default in Production |
| --- | --- | --- |
| `GET /health` | F0 | On |
| `GET /` | F0 | On (minimal metadata only) |
| `POST /api/auth/request-access` | F2 | On |
| `POST /api/auth/verify` | F2 | On |
| `POST /api/metrics/interaction` | F4 | Off until F4 merged |
| `GET /api/host/stats` | F6 | Off until F6 merged |

---

## 2. Current status

| Item | Status | Action |
| --- | --- | --- |
| Auth endpoints | Implemented | Keep — needed for F2 |
| `GET /api/host/stats` | Implemented, placeholder | **Gate behind `Features:HostStats`** until F6 |
| `POST /api/metrics/interaction` | Implemented | **Gate behind `Features:InteractionMetrics`** until F4 |
| Bulk `/api/mock/*` | Not implemented | **Do not implement** (use fixtures instead) |
| Frontend | Not started | Start at F1 |

---

## 3. How to test without mock endpoints

| Need | Approach |
| --- | --- |
| Layout / CSS | Static pages, no API |
| Gateway UI before SMTP | Real `request-access` + OTP from **API console log** |
| Pipeline / docs / terminal | `public/fixtures/*.json` and `public/docs/*.md` loaded by the SPA |
| Orchestration charts | Fixture `public/fixtures/host-stats.json` until F6; then switch `apiClient` to real `GET /api/host/stats` |
| Interaction logging | Defer calls until F4; optional `console.debug` in dev |
| HTTP smoke tests | [`Docs/Postman/`](Postman/) (collection + environment) or [`Portfolio.Api.http`](../src/Portfolio.Api/Portfolio.Api.http) — only sections for **completed** features |

---

## 4. Functional features (delivery order)

Complete **one feature fully** (backend flag + frontend + tests) before starting the next.

```text
F0 ──► F1 ──► F2 ──► F3 ──► F4 ──► F5 ──► F6 ──► F7 ──► F8 ──► F9
 │      │      │      │      │      │      │      │      │
 │      │      │      │      │      │      │      │      └─ Docker deploy
 │      │      │      │      │      │      │      └─ Docs vault (static)
 │      │      │      │      │      │      └─ Automation (static)
 │      │      │      │      │      └─ Orchestration (host stats API)
 │      │      │      │      └─ Pipeline (static)
 │      │      │      └─ Interaction metrics API
 │      │      └─ Story router + JWT guard
 │      └─ Gateway + auth API
 └─ API baseline + feature flags
```

---

### F0 — API baseline & feature flags

**Goal:** Safe foundation; dormant routes not exposed.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F0.1 | Add `Features:HostStats`, `Features:InteractionMetrics` (default `false`) | — | Production config has both `false` |
| F0.2 | Map `host/stats` and `metrics/interaction` only when flag is `true` | — | With flags off, routes return **404** |
| F0.3 | Keep `GET /health`, minimal `GET /` | — | `Portfolio.Api.http` → Health only |

**Endpoints live after F0:** `GET /`, `GET /health` (+ auth routes exist but are not used until F2).

**Config (`appsettings.Development.json` example):**

```json
"Features": {
  "HostStats": false,
  "InteractionMetrics": false
}
```

---

### F1 — Frontend shell (no new API)

**Goal:** Vite SPA, routing, styling; zero backend coupling.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F1.1 | No change | Create `src/Portfolio.Web`, `npm run dev` | Landing at `/` |
| F1.2 | CORS: allow `http://localhost:5173` | `VITE_API_BASE_URL` in `.env.development` | Preflight succeeds |
| F1.3 | No change | `apiClient.ts` — only `getHealth()` for now | Call `GET /health` from landing |

**Endpoints used:** `GET /health` only.

---

### F2 — Gateway (gatekeeper)

**Goal:** Email + OTP + JWT; only public write paths besides health.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F2.1 | Confirm rate limit on `/api/auth/*` | `/gateway` form → `request-access` | 200 + message |
| F2.2 | — | Verify screen → `verify` | JWT stored; redirect to `/story` |
| F2.3 | SMTP via user secrets (optional) | Show generic errors (no stack traces) | Email received OR console OTP |
| F2.4 | — | Validation UI for bad email | 400 validation problem |

**Endpoints enabled:** `POST /api/auth/request-access`, `POST /api/auth/verify`.

**Sample bodies:** see [§6.1](#61-auth-f2).

**Do not add:** mock auth, bypass codes, or test-only auth routes.

---

### F3 — Story layout & JWT guard

**Goal:** Protected story routes; no new API.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F3.1 | No change | Router: `/story`, child routes stubbed | Without JWT → redirect `/gateway` |
| F3.2 | No change | Nav shell for five blocks (empty placeholders) | With JWT → `/story` loads |
| F3.3 | No change | Logout clears token | Re-access requires F2 again |

**Endpoints used:** none new (JWT validated client-side until a protected API is called).

---

### F4 — Interaction telemetry

**Goal:** Log engagement when blocks fire events; API exists only when this feature ships.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F4.1 | Set `Features:InteractionMetrics: true` | `logInteraction(blockId, eventType)` in `apiClient` | Authenticated `POST` → 204 |
| F4.2 | Validate `blockId` / `eventType` length and allowed chars | Gateway `view` / `verify_success` events | Row in SQLite `InteractionLog` |
| F4.3 | Reject unauthenticated calls | No call from public pages | 401 without Bearer |

**Endpoint enabled:** `POST /api/metrics/interaction` (JWT required).

**Sample body:** see [§6.2](#62-metrics-f4).

---

### F5 — Pipeline block (static only)

**Goal:** CI/CD visual; no backend route (avoids unused story API).

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F5.1 | No new routes | Load `public/fixtures/pipeline.json` | Graph renders |
| F5.2 | — | Node click → YAML panel from fixture | UI only |
| F5.3 | — | If F4 done: `logInteraction('pipeline', 'node_click', …)` | 204 |

**Fixture contract** (`public/fixtures/pipeline.json`):

```json
{
  "title": "Deploy pipeline",
  "nodes": [{ "id": "build", "label": "dotnet build", "status": "success" }],
  "edges": [{ "from": "checkout", "to": "build" }],
  "yamlSnippets": { "build": "jobs:\n  build:\n    runs-on: ubuntu-latest" }
}
```

---

### F6 — Orchestration block (host stats)

**Goal:** Real server metrics; enable API only with this feature.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F6.1 | Set `Features:HostStats: true`; improve `HostStatsService` | Dashboard calls `GET /api/host/stats` | 200 + JWT |
| F6.2 | Cache responses ~30s server-side | Poll or manual refresh | No hammering |
| F6.3 | — | Until F6.1: use `public/fixtures/host-stats.json` | Same UI, no API |

**Endpoint enabled:** `GET /api/host/stats` (JWT required).

**Sample response:** see [§6.3](#63-host-stats-f6).

---

### F7 — Automation block (static demo)

**Goal:** Terminal UX without arbitrary code execution on the server.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F7.1 | **No** `POST /api/automation/run` unless you add a sandboxed, allow-listed executor later | Button plays script from `public/fixtures/automation-parse-logs.json` | Lines animate in UI |
| F7.2 | — | If F4 done: `logInteraction('automation', 'run_script', …)` | 204 |

**Do not add:** open-ended script execution endpoint (high risk).

---

### F8 — Documentation vault (static)

**Goal:** Show markdown from the repo copy in the SPA build.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F8.1 | No new routes | Copy or symlink docs to `public/docs/` | List + viewer |
| F8.2 | — | Fetch `implementationPlan.md`, `solutionDesign.md` | Rendered markdown |
| F8.3 | — | If F4 done: `open_doc` interaction | 204 |

**Do not add:** `GET /api/story/docs` unless you need dynamic docs from DB (not required for this project).

---

### F9 — Docker & production hardening

**Goal:** Deploy; minimal attack surface.

| Step | Backend | Frontend | Test |
| --- | --- | --- | --- |
| F9.1 | `Features:*` only what you ship | nginx serves `dist/` | Compose up |
| F9.2 | No Development flags in prod image | API behind nginx `/api` proxy | No 404 probes on disabled routes |
| F9.3 | Cloudflare Tunnel | TLS at edge | No open router ports |
| F9.4 | — | Vault block points at baked-in docs | Static only |

**Production checklist:**

- [ ] `Features:HostStats` / `InteractionMetrics` match shipped UI blocks
- [ ] No mock or debug auth routes in assembly
- [ ] `Jwt:SigningKey` from secret store
- [ ] CORS allows only production SPA origin

---

## 5. Feature ↔ endpoint matrix

| Feature | UI route | Endpoints activated | Static fixtures |
| --- | --- | --- | --- |
| F0 | — | `/`, `/health` | — |
| F1 | `/` | `/health` | — |
| F2 | `/gateway` | `/api/auth/*` | — |
| F3 | `/story/*` | — | — |
| F4 | (all blocks) | `POST /api/metrics/interaction` | — |
| F5 | `/story/pipeline` | — | `fixtures/pipeline.json` |
| F6 | `/story/orchestration` | `GET /api/host/stats` | `fixtures/host-stats.json` (pre-F6) |
| F7 | `/story/automation` | — | `fixtures/automation-*.json` |
| F8 | `/story/docs` | — | `docs/*.md` |
| F9 | — | Same as shipped features | Baked into `dist/` |

---

## 6. API reference (by feature)

### 6.1 Auth (F2)

`POST /api/auth/request-access`

```json
{ "fullName": "Jane Recruiter", "email": "jane@acme.com", "company": "Acme Corp" }
```

`POST /api/auth/verify`

```json
{ "email": "jane@acme.com", "code": "123456" }
```

→ `{ "accessToken": "<jwt>", "expiresAt": "..." }`

### 6.2 Metrics (F4)

`POST /api/metrics/interaction` — **Bearer JWT required**

```json
{ "blockId": "gateway", "eventType": "view", "payloadJson": null }
```

### 6.3 Host stats (F6)

`GET /api/host/stats` — **Bearer JWT required**

```json
{
  "cpuPercent": 23.4,
  "memoryUsedMb": 512,
  "memoryTotalMb": 8192,
  "containerStatuses": ["api: running (healthy)"]
}
```

---

## 7. Per-feature test checklist

| ID | Feature | Pass criteria |
| --- | --- | --- |
| T-F0 | Baseline | With flags off, `host/stats` and `metrics/interaction` return **404** |
| T-F1 | Shell | SPA loads; `GET /health` OK |
| T-F2 | Gateway | Real OTP flow; JWT issued; rate limit after abuse |
| T-F3 | Guard | `/story` blocked without token |
| T-F4 | Metrics | 401 without JWT; 204 with JWT; DB row created |
| T-F5 | Pipeline | Fixture load; no network call to story API |
| T-F6 | Orchestration | Real stats only when flag on; JWT enforced |
| T-F7 | Automation | Fixture script only; no server execution |
| T-F8 | Vault | Markdown from `public/docs` |
| T-F9 | Deploy | Feature flags match UI; no extra routes exposed |

---

## 8. PowerShell snippets (real API only)

Run only sections for **completed** features.

```powershell
$base = "https://localhost:7262"

# F0 / F1
Invoke-RestMethod "$base/health"

# F2
Invoke-RestMethod "$base/api/auth/request-access" -Method POST -ContentType "application/json" `
  -Body '{"fullName":"Test User","email":"test@example.com","company":"Test Co"}'
$auth = Invoke-RestMethod "$base/api/auth/verify" -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","code":"<otp-from-console>"}'
$token = $auth.accessToken

# F4 (after Features:InteractionMetrics = true)
Invoke-RestMethod "$base/api/metrics/interaction" -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{"blockId":"gateway","eventType":"view","payloadJson":null}'

# F6 (after Features:HostStats = true)
Invoke-RestMethod "$base/api/host/stats" -Headers @{ Authorization = "Bearer $token" }
```

---

## 9. Configuration reference

| Key | When | Example |
| --- | --- | --- |
| `Features:HostStats` | F6 | `true` |
| `Features:InteractionMetrics` | F4 | `true` |
| `VITE_API_BASE_URL` | F1 | `https://localhost:7262` |
| `Cors:AllowedOrigins` | F1 | `http://localhost:5173` |
| `Jwt:SigningKey` | F2 | user-secrets (≥32 chars) |

**Removed from plan:** `VITE_USE_MOCK_API`, `MockApi:Enabled`, `/api/mock/*`.

---

## 10. Suggested PR sequence

| PR | Feature | Touch |
| --- | --- | --- |
| 1 | F0 | Feature flags; conditional endpoint mapping |
| 2 | F1 | `Portfolio.Web` scaffold |
| 3 | F2 | Gateway UI + auth integration |
| 4 | F3 | Story layout + guard |
| 5 | F4 | Metrics flag on + logging |
| 6 | F5 | Pipeline fixture + UI |
| 7 | F6 | Host stats flag on + dashboard |
| 8 | F7 | Automation fixture + UI |
| 9 | F8 | Docs vault |
| 10 | F9 | Docker + nginx + tunnel |

One PR = one feature = one slice of API surface.

---

## 11. Related documents

* [`solutionDesign.md`](solutionDesign.md) — architecture
* [`README.md`](../README.md) — run instructions
* [`Docs/Postman/`](Postman/) — Postman collection (primary manual QA)
* [`Portfolio.Api.http`](../src/Portfolio.Api/Portfolio.Api.http) — HTTP samples (grouped by feature)
