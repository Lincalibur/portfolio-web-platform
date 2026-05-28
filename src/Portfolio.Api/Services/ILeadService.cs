using Portfolio.Api.Contracts;

namespace Portfolio.Api.Services;

public interface ILeadService
{
    Task<RequestAccessResponse> RequestAccessAsync(RequestAccessRequest request, CancellationToken cancellationToken = default);

    Task<VerifyOtpResponse?> VerifyOtpAsync(VerifyOtpRequest request, CancellationToken cancellationToken = default);
}
