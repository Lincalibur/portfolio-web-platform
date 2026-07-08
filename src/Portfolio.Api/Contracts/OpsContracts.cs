namespace Portfolio.Api.Contracts;

public record AdminLoginRequest(string Username, string Password);

public record AdminLoginResponse(string AccessToken, DateTime ExpiresAt);

public record OpsIncidentEntry(
    DateTime Timestamp,
    string ResourcePath,
    string Severity,
    string Status,
    string Summary);

public record OpsReportResponse(
    IReadOnlyList<OpsIncidentEntry> Incidents,
    int TotalCvDownloadsLast7Days,
    IReadOnlyList<string> ActiveTrafficHotspots,
    double StorageFootprintMb,
    int RetentionDays);

public record RecordTrafficRequest(string? MetricType);
