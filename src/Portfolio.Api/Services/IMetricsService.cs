using Portfolio.Api.Contracts;

namespace Portfolio.Api.Services;

public interface IMetricsService
{
    Task LogInteractionAsync(Guid? leadId, LogInteractionRequest request, CancellationToken cancellationToken = default);
}
