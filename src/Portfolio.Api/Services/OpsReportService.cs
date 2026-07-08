using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Portfolio.Api.Configuration;
using Portfolio.Api.Contracts;
using Portfolio.Api.Data;

namespace Portfolio.Api.Services;

public class OpsReportService(
    AppDbContext dbContext,
    IOptions<TrafficLoggingSettings> settings) : IOpsReportService
{
    private readonly TrafficLoggingSettings _settings = settings.Value;

    public async Task<OpsReportResponse> GetReportAsync(CancellationToken cancellationToken = default)
    {
        var retentionDays = Math.Max(1, _settings.RetentionDays);
        var windowStartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-retentionDays));
        var windowStartTimestamp = DateTime.UtcNow.AddDays(-retentionDays);

        var incidents = await dbContext.SecurityAuditTrails
            .AsNoTracking()
            .Where(e => e.Timestamp >= windowStartTimestamp)
            .OrderByDescending(e => e.Timestamp)
            .Select(e => new OpsIncidentEntry(
                e.Timestamp,
                e.ResourcePath,
                e.Severity,
                e.Status,
                $"CRITICAL PROBE INTERCEPTED | Resource: {e.ResourcePath} | Severity: {e.Severity} | Status: {e.Status}"))
            .ToListAsync(cancellationToken);

        var trafficRows = await dbContext.TrafficMetrics
            .AsNoTracking()
            .Where(m => m.Date >= windowStartDate)
            .ToListAsync(cancellationToken);

        var cvDownloads = trafficRows
            .Where(m => m.MetricType.Equals("CvDownload", StringComparison.OrdinalIgnoreCase))
            .Sum(m => m.Count);

        var hotspots = trafficRows
            .Where(m => m.MetricType.Equals("PageView", StringComparison.OrdinalIgnoreCase))
            .GroupBy(m => m.Region)
            .OrderByDescending(g => g.Sum(m => m.Count))
            .Take(5)
            .Select(g => g.Key)
            .ToList();

        var trafficCount = await dbContext.TrafficMetrics.CountAsync(cancellationToken);
        var incidentCount = await dbContext.SecurityAuditTrails.CountAsync(cancellationToken);
        var storageFootprintMb = EstimateStorageFootprintMb(trafficCount, incidentCount);

        return new OpsReportResponse(
            incidents,
            cvDownloads,
            hotspots,
            storageFootprintMb,
            retentionDays);
    }

    private static double EstimateStorageFootprintMb(int trafficCount, int incidentCount)
    {
        const double trafficRowBytes = 96;
        const double incidentRowBytes = 256;
        var totalBytes = (trafficCount * trafficRowBytes) + (incidentCount * incidentRowBytes);
        return Math.Round(totalBytes / (1024d * 1024d), 2);
    }
}
