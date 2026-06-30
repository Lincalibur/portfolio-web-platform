using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Portfolio.Api.Configuration;
using Portfolio.Api.Data;
using Portfolio.Api.Entities;

namespace Portfolio.Api.Services;

public class TrafficLoggingService(
    AppDbContext dbContext,
    IOptions<TrafficLoggingSettings> settings) : ITrafficLoggingService
{
    private readonly TrafficLoggingSettings _settings = settings.Value;

    public async Task IncrementTrafficAsync(
        string region,
        string metricType,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var normalizedRegion = string.IsNullOrWhiteSpace(region) ? "Unknown" : region.Trim();
        var normalizedMetricType = string.IsNullOrWhiteSpace(metricType) ? "PageView" : metricType.Trim();

        var metric = await dbContext.TrafficMetrics
            .FirstOrDefaultAsync(
                m => m.Date == today &&
                     m.Region == normalizedRegion &&
                     m.MetricType == normalizedMetricType,
                cancellationToken);

        if (metric is null)
        {
            dbContext.TrafficMetrics.Add(new TrafficMetric
            {
                Id = Guid.NewGuid(),
                Date = today,
                Region = normalizedRegion,
                MetricType = normalizedMetricType,
                Count = 1
            });
        }
        else
        {
            metric.Count += 1;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task LogSecurityIncidentAsync(
        string resourcePath,
        string incidentType,
        string severity,
        string? anonymizedSource,
        CancellationToken cancellationToken = default)
    {
        dbContext.SecurityAuditTrails.Add(new SecurityAuditTrail
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            ResourcePath = resourcePath,
            IncidentType = incidentType,
            Severity = severity,
            Status = "Anonymized & Dropped",
            AnonymizedSource = anonymizedSource
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task PruneExpiredLogsAsync(CancellationToken cancellationToken = default)
    {
        var retentionDays = Math.Max(1, _settings.RetentionDays);
        var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-retentionDays));
        var cutoffTimestamp = DateTime.UtcNow.AddDays(-retentionDays);

        await dbContext.TrafficMetrics
            .Where(m => m.Date < cutoffDate)
            .ExecuteDeleteAsync(cancellationToken);

        await dbContext.SecurityAuditTrails
            .Where(e => e.Timestamp < cutoffTimestamp)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
