using System.Security.Claims;
using Microsoft.Extensions.Options;
using Portfolio.Api.Configuration;
using Portfolio.Api.Contracts;
using Portfolio.Api.Security;

namespace Portfolio.Api.Services;

public class AdminAuthService(
    IOptions<AdminSettings> adminOptions,
    ITokenService tokenService) : IAdminAuthService
{
    private readonly AdminSettings _settings = adminOptions.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_settings.Username) &&
        !string.IsNullOrWhiteSpace(_settings.PasswordHash);

    public AdminLoginResponse? Login(AdminLoginRequest request)
    {
        if (!IsConfigured)
        {
            return null;
        }

        var username = request.Username.Trim();
        if (!string.Equals(username, _settings.Username, StringComparison.Ordinal) ||
            !PasswordHasher.Verify(request.Password, _settings.PasswordHash))
        {
            return null;
        }

        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim("scope", "ops")
        ]);

        var (token, expiresAt) = tokenService.CreateAccessToken(identity, _settings.AccessTokenMinutes);
        return new AdminLoginResponse(token, expiresAt);
    }
}
