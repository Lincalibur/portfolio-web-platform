using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Portfolio.Api.Contracts;
using Portfolio.Api.Services;

namespace Portfolio.Api.Extensions;

public static class EndpointRouteBuilderExtensions
{
    public static IEndpointRouteBuilder MapPortfolioEndpoints(this IEndpointRouteBuilder app)
    {
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

        return app;
    }
}
