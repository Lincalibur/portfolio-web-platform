using Portfolio.Api.Contracts;

namespace Portfolio.Api.Services;

public interface IHostStatsService
{
    Task<HostStatsResponse> GetStatsAsync(CancellationToken cancellationToken = default);
}
