using Portfolio.Api.Services;

namespace Portfolio.Api.Hosting;

public class LogRetentionHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<LogRetentionHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = GetDelayUntilNextMidnightUtc();
            logger.LogInformation("Log retention worker scheduled in {Delay}", delay);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }

            await RunPruneAsync(stoppingToken);
        }
    }

    private async Task RunPruneAsync(CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var trafficLoggingService = scope.ServiceProvider.GetRequiredService<ITrafficLoggingService>();
            await trafficLoggingService.PruneExpiredLogsAsync(cancellationToken);
            logger.LogInformation("Traffic and security audit logs pruned successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to prune expired traffic logs.");
        }
    }

    private static TimeSpan GetDelayUntilNextMidnightUtc()
    {
        var now = DateTime.UtcNow;
        var nextMidnight = now.Date.AddDays(1);
        return nextMidnight - now;
    }
}
