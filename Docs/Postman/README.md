# Postman — Portfolio.Api

Manual and automated API tests for local development. Structured to match [`implementationPlan.md`](../implementationPlan.md) (features **F0**, **F2**, **F4**, **F6**).

## Files

| File | Purpose |
| --- | --- |
| [`Portfolio.Api.postman_collection.json`](Portfolio.Api.postman_collection.json) | Requests, tests, and collection runner flow |
| [`Portfolio.Local.postman_environment.json`](Portfolio.Local.postman_environment.json) | `baseUrl`, test user, `otpCode`, `accessToken` |

## Import

1. Open Postman → **Import** → select both JSON files in this folder.
2. Choose environment **Portfolio — Local (Development)**.
3. Disable **SSL certificate verification** only if you have not run `dotnet dev-certs https --trust` (prefer trusting the dev cert instead).

## Quick test (auth)

1. Start API: `dotnet run --project src/Portfolio.Api`
2. **F2 → Request access**
3. Copy OTP from the Visual Studio / terminal log
4. Set environment variable **`otpCode`**
5. **F2 → Verify OTP** — saves **`accessToken`**
6. Run **F4** / **F6** requests (Bearer uses `accessToken`)

## Collection Runner

Use the **Flows** folder in order. Set **`otpCode`** before step 03.

## Keeping the collection updated

When you add or change an API endpoint:

1. Add or edit a request under the matching **feature folder** (F0, F2, F4, F6, …).
2. Add **Tests** tab scripts for expected status codes and response shape.
3. If the route needs JWT, use Bearer `{{accessToken}}` (set by **Verify OTP**).
4. Update the collection **description** and this README if a new feature flag applies.
5. Add a note in [`implementationPlan.md`](../implementationPlan.md) §3 if Postman replaces `.http` for that feature.

Do **not** add `/api/mock` requests — use real endpoints and frontend fixtures per the implementation plan.

## Environment variables

| Variable | Description |
| --- | --- |
| `baseUrl` | API root (default `https://localhost:7262`) |
| `testEmail` / `testFullName` / `testCompany` | Gateway payloads |
| `otpCode` | From API console after request-access |
| `accessToken` | Set automatically by Verify OTP tests |
| `featuresHostStats` | Documentation only until F0 flags exist in API |
| `featuresInteractionMetrics` | Documentation only until F0 flags exist in API |

## Parity

VS / REST Client samples: [`src/Portfolio.Api/Portfolio.Api.http`](../../src/Portfolio.Api/Portfolio.Api.http)

When you change endpoints in code, update **Postman**, **Portfolio.Api.http**, and **implementationPlan.md** in the same PR.
