To achieve this exact filtering and auto-cleanup behavior, you will modify the logic to use **Conditional Logging** for security incidents and an **Automatic Pruning/TTL (Time-To-Live)** policy for your generic traffic stats.

This keeps your database completely lean, ensuring you only see critical alerts when someone actively tests your site, while generic traffic numbers automatically discard themselves before taking up space.

> **Status:** Implemented in `Portfolio.Api` (middleware, retention worker, `/api/ops/report`) and `Portfolio.Web` (`/admin/login`, `/admin` dashboard). Admin credentials are configured via user secrets — see [`howToRunGuide.md`](howToRunGuide.md) §4.5.

Here is the updated step-by-step instructional guide to implement these filters on your backend.

---

# **IMPLEMENTATION COMPONENT: CONDITIONAL AUDIT & TRAFFIC PRUNER**

## **Phase 1: Operational Logging Rules**

To prevent cluttering your database with standard user activity, enforce a strict distinction between standard counts and persistent incident alerts:

1. **Traffic Metrics (Ephemeral Stats):** Standard page hits do not generate individual log entries. They only increment a basic flat counter tied to a specific date and location.
2. **Security Incidents (Conditional Logs):** A detailed row in the `SecurityAuditTrail` is **only** written if a request explicitly tries to access a path on your directory blacklist. If a clean user encounters a standard 404 by accident (e.g., clicking an old broken link to a project asset), it returns a 404 code but **does not** generate a security incident report.

---

## **Phase 2: Architectural Data Flow & Lifecycle**

This layout tracks how standard data is summarized and old logs are completely flushed out of the system.

```
[ Inbound HTTP Request ]
          │
          ▼
┌──────────────────────────────────────────────┐
│  Step 1: Check Target Against Blacklist     │
└──────────────────────────────────────────────┘
          │
          ├─── YES (Suspicious Directory Match)
          │     │
          │     ▼
          │   ┌──────────────────────────────────────────────┐
          │   │  Action: Return 404 + Write Incident Log     │
          │   └──────────────────────────────────────────────┘
          │
          └─── NO (Standard Traffic / Normal View)
                │
                ▼
              ┌──────────────────────────────────────────────┐
              │  Action: Increment Flat Page Counter Only    │
              └──────────────────────────────────────────────┘
                                │
                                ▼
              ┌──────────────────────────────────────────────┐
              │  Midnight Chron Job: Purge Logs > X Days Old │
              └──────────────────────────────────────────────┘

```

---

## **Phase 3: Backend Implementation Logic**

If your backend engine is running on ASP.NET Core, use this logic within your custom middleware file to filter incoming directories and handle automatic cleanups.

### **1. Filtering Suspicious Directories Only**

Define a strict hash set of known exploitation targets. An entry is only recorded to your database log if it hits an exact match.

```csharp
// Define high-risk targets explicitly
private static readonly HashSet<string> SuspiciousDirectories = new()
{
    "/.env", "/admin", "/wp-admin", "/wp-login.php", "/config.php", "/actuator"
};

public async Task InvokeAsync(HttpContext context)
{
    string requestedPath = context.Request.Path.Value.ToLower();

    // Condition: Check if the path is explicitly a known reconnaissance target
    if (SuspiciousDirectories.Any(dir => requestedPath.Contains(dir)))
    {
        // 1. Immediately cut pipeline execution and issue a clean 404 response
        context.Response.StatusCode = StatusCodes.Status404NotFound;

        // 2. ONLY commit a persistent alert log for this specific match
        await LogSecurityIncidentAsync(requestedPath, "DirectoryProbing", "Medium");
        return;
    }

    // Otherwise, allow normal site delivery and increment the day's flat counter metric
    await IncrementTrafficCountAsync(context);
    await _next(context);
}

```

### **2. Automated Retention & Pruning Engine (The Garbage Collector)**

To stop your database from piling up old redundant data, establish a scheduled automated maintenance rule. This script uses simple SQL utility commands to delete entries older than your specified threshold (e.g., 7 days).

```csharp
public async Task PruneExpiredLogsAsync()
{
    // Define your threshold limit (e.g., automatically keep only the last 7 days of data)
    int retentionDays = 7;
    DateTime cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

    // SQL equivalent: DELETE FROM TrafficMetrics WHERE Date < @cutoffDate
    // SQL equivalent: DELETE FROM SecurityAuditTrail WHERE Timestamp < @cutoffDate
    await _database.ExecuteAsync("DELETE FROM TrafficMetrics WHERE Date < @0", cutoffDate);
    await _database.ExecuteAsync("DELETE FROM SecurityAuditTrail WHERE Timestamp < @0", cutoffDate);
    
    // System health check tracking log
    Console.WriteLine($"[MAINTENANCE] Redundant logs older than {cutoffDate:yyyy-MM-dd} successfully cleared.");
}

```

*Note: You can trigger this maintenance routine asynchronously every night at midnight using a basic background worker class (`IHostedService`) in your application setup.*

---

## **Phase 4: Admin Reporting Interface Specifications**

Your updated `/api/ops/report` endpoint will now render a highly filtered, clean operational timeline.

### **Dashboard Output Layout**

#### **Section A: Active Incident Timeline (Conditional)**

This view will remain completely empty unless an active scan or automated probe occurs, keeping your sightline clear of benign traffic chatter:

* `[2026-06-30 14:15] 🛑 CRITICAL PROBE INTERCEPTED | Resource: /.env | Severity: Medium | Status: Anonymized & Dropped`
* `[2026-06-30 14:16] 🛑 CRITICAL PROBE INTERCEPTED | Resource: /wp-admin | Severity: Low | Status: Anonymized & Dropped`

#### **Section B: High-Level Clean Summary**

* **Total CV Downloads (Last 7 Days):** `45`
* **Active Traffic Hotspots:** `Pretoria (ZA), Cape Town (ZA)`
* **System Storage Footprint:** `0.02 MB (Optimized via Auto-Purge Policy)`