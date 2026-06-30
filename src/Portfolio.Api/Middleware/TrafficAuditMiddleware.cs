using Microsoft.Extensions.Options;
using Portfolio.Api.Configuration;
using Portfolio.Api.Http;
using Portfolio.Api.Services;

namespace Portfolio.Api.Middleware;

public class TrafficAuditMiddleware(
    RequestDelegate next,
    IOptions<TrafficLoggingSettings> settings)
{
    private readonly TrafficLoggingSettings _settings = settings.Value;

    public async Task InvokeAsync(HttpContext context, ITrafficLoggingService trafficLoggingService)
    {
        var requestedPath = (context.Request.Path.Value ?? "/").ToLowerInvariant();

        if (IsSuspiciousPath(requestedPath))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await trafficLoggingService.LogSecurityIncidentAsync(
                requestedPath,
                "DirectoryProbing",
                ResolveSeverity(requestedPath),
                RequestRegionResolver.AnonymizeSource(context),
                context.RequestAborted);
            return;
        }

        if (ShouldIncrementTraffic(context))
        {
            var region = RequestRegionResolver.ResolveRegion(context);
            await trafficLoggingService.IncrementTrafficAsync(region, "PageView", context.RequestAborted);
        }

        await next(context);
    }

    private bool IsSuspiciousPath(string requestedPath)
    {
        if (requestedPath.StartsWith("/api/admin", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        foreach (var directory in _settings.SuspiciousDirectories)
        {
            if (requestedPath.Contains(directory, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static bool ShouldIncrementTraffic(HttpContext context)
    {
        if (!HttpMethods.IsGet(context.Request.Method))
        {
            return false;
        }

        var path = context.Request.Path.Value ?? "/";
        if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return path is "/" or "/health";
    }

    private static string ResolveSeverity(string requestedPath)
    {
        if (requestedPath.Contains("/.env", StringComparison.OrdinalIgnoreCase) ||
            requestedPath.Contains("/config.php", StringComparison.OrdinalIgnoreCase))
        {
            return "Medium";
        }

        return "Low";
    }
}
