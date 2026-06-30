using Portfolio.Api.Contracts;

namespace Portfolio.Api.Services;

public interface IOpsReportService
{
    Task<OpsReportResponse> GetReportAsync(CancellationToken cancellationToken = default);
}
