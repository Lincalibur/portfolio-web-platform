using System.Security.Claims;

namespace Portfolio.Api.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateAccessToken(ClaimsIdentity identity);
}
