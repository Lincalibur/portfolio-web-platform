using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Portfolio.Api.Contracts;
using Portfolio.Api.Http;
using Portfolio.Api.Services;

namespace Portfolio.Api.Extensions;

public static class EndpointRouteBuilderExtensions
{
    public static IEndpointRouteBuilder MapPortfolioEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", () => Results.Ok(new
        {
            name = "Portfolio.Api",
            status = "running",
            endpoints = new
            {
                health = "/health",
                requestAccess = "POST /api/auth/request-access",
                verify = "POST /api/auth/verify",
                hostStats = "GET /api/host/stats (JWT required)",
                adminLogin = "POST /api/admin/login",
                opsReport = "GET /api/ops/report (Admin JWT required)"
            }
        }))
            .WithName("Root")
            .WithTags("Meta");

        app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
            .WithName("Health")
            .WithTags("Health");

        var auth = app.MapGroup("/api/auth")
            .WithTags("Auth")
            .RequireRateLimiting("Auth");

        auth.MapPost("/request-access", async Task<Results<Ok<RequestAccessResponse>, ValidationProblem>> (
            RequestAccessRequest request,
            ILeadService leadService) =>
        {
            try
            {
                var response = await leadService.RequestAccessAsync(request);
                return TypedResults.Ok(response);
            }
            catch (ValidationException ex)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    [nameof(request.Email)] = [ex.Message]
                });
            }
        });

        auth.MapPost("/verify", async Task<Results<Ok<VerifyOtpResponse>, UnauthorizedHttpResult>> (
            VerifyOtpRequest request,
            ILeadService leadService) =>
        {
            var response = await leadService.VerifyOtpAsync(request);
            return response is null
                ? TypedResults.Unauthorized()
                : TypedResults.Ok(response);
        });

        var metrics = app.MapGroup("/api/metrics")
            .WithTags("Metrics")
            .RequireAuthorization();

        metrics.MapPost("/interaction", async Task<NoContent> (
            LogInteractionRequest request,
            IMetricsService metricsService,
            ClaimsPrincipal user) =>
        {
            Guid? leadId = Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
            await metricsService.LogInteractionAsync(leadId, request);
            return TypedResults.NoContent();
        });

        app.MapGet("/api/host/stats", async Task<Ok<HostStatsResponse>> (
            IHostStatsService hostStatsService,
            CancellationToken cancellationToken) =>
        {
            var stats = await hostStatsService.GetStatsAsync(cancellationToken);
            return TypedResults.Ok(stats);
        })
            .RequireAuthorization()
            .WithTags("Host");

        var traffic = app.MapGroup("/api/metrics/traffic")
            .WithTags("Traffic")
            .RequireRateLimiting("TrafficBeacon");

        traffic.MapPost("/pageview", async Task<NoContent> (
            HttpContext httpContext,
            ITrafficLoggingService trafficLoggingService,
            RecordTrafficRequest? request) =>
        {
            var region = RequestRegionResolver.ResolveRegion(httpContext);
            var metricType = string.IsNullOrWhiteSpace(request?.MetricType) ? "PageView" : request.MetricType.Trim();
            await trafficLoggingService.IncrementTrafficAsync(region, metricType, httpContext.RequestAborted);
            return TypedResults.NoContent();
        });

        var admin = app.MapGroup("/api/admin")
            .WithTags("Admin")
            .RequireRateLimiting("AdminAuth");

        admin.MapPost("/login", async Task<Results<Ok<AdminLoginResponse>, UnauthorizedHttpResult, ProblemHttpResult>> (
            AdminLoginRequest request,
            IAdminAuthService adminAuthService) =>
        {
            if (!adminAuthService.IsConfigured)
            {
                return TypedResults.Problem(
                    "Admin portal is not configured. Set Admin credentials via user secrets.",
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }

            var response = adminAuthService.Login(request);
            return response is null
                ? TypedResults.Unauthorized()
                : TypedResults.Ok(response);
        });

        app.MapGet("/api/ops/report", async Task<Ok<OpsReportResponse>> (
            IOpsReportService opsReportService,
            CancellationToken cancellationToken) =>
        {
            var report = await opsReportService.GetReportAsync(cancellationToken);
            return TypedResults.Ok(report);
        })
            .RequireAuthorization("AdminOnly")
            .WithTags("Ops");

        return app;
    }
}
