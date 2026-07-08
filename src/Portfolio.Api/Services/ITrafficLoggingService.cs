namespace Portfolio.Api.Services;

public interface ITrafficLoggingService
{
    Task IncrementTrafficAsync(
        string region,
        string metricType,
        CancellationToken cancellationToken = default);

    Task LogSecurityIncidentAsync(
        string resourcePath,
        string incidentType,
        string severity,
        string? anonymizedSource,
        CancellationToken cancellationToken = default);

    Task PruneExpiredLogsAsync(CancellationToken cancellationToken = default);
}
