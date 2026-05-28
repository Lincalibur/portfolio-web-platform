using Portfolio.Api.Contracts;

namespace Portfolio.Api.Services;

/// <summary>
/// Placeholder host metrics until Docker/Linux integration is added in Phase 3.
/// </summary>
public class HostStatsService : IHostStatsService
{
    public Task<HostStatsResponse> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var response = new HostStatsResponse(
            CpuPercent: 0,
            MemoryUsedMb: GC.GetTotalMemory(false) / 1024d / 1024d,
            MemoryTotalMb: 0,
            ContainerStatuses: ["api: running (placeholder)"]);

        return Task.FromResult(response);
    }
}
