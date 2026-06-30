using Portfolio.Api.Contracts;

namespace Portfolio.Api.Services;

public interface IAdminAuthService
{
    bool IsConfigured { get; }

    AdminLoginResponse? Login(AdminLoginRequest request);
}
