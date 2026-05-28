using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Portfolio.Api.Configuration;

namespace Portfolio.Api.Services;

public class OtpHasher(IOptions<JwtSettings> jwtOptions) : IOtpHasher
{
    private readonly byte[] _key = Encoding.UTF8.GetBytes(
        jwtOptions.Value.SigningKey.Length >= 32
            ? jwtOptions.Value.SigningKey
            : throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters."));

    public string Hash(string otp, string email)
    {
        var payload = Encoding.UTF8.GetBytes($"{email.ToLowerInvariant()}:{otp}");
        var hash = HMACSHA256.HashData(_key, payload);
        return Convert.ToHexString(hash);
    }

    public bool Verify(string otp, string email, string storedHash) =>
        CryptographicOperations.FixedTimeEquals(
            Convert.FromHexString(storedHash),
            Convert.FromHexString(Hash(otp, email)));
}
