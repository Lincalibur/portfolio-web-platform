using System.Security.Cryptography;
using System.Text;

namespace Portfolio.Api.Http;

public static class RequestRegionResolver
{
    private static readonly Dictionary<string, string> CountryLabels = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ZA"] = "South Africa (ZA)",
        ["US"] = "United States (US)",
        ["GB"] = "United Kingdom (GB)",
        ["DE"] = "Germany (DE)",
        ["AU"] = "Australia (AU)",
        ["NL"] = "Netherlands (NL)",
        ["FR"] = "France (FR)",
        ["IN"] = "India (IN)",
        ["BR"] = "Brazil (BR)",
        ["CA"] = "Canada (CA)",
    };

    /// <summary>
    /// Resolves a display-friendly region label from proxy or CDN headers.
    /// </summary>
    /// <param name="context">The current HTTP context.</param>
    /// <returns>A region label suitable for aggregate traffic metrics.</returns>
    public static string ResolveRegion(HttpContext context)
    {
        var country = context.Request.Headers["CF-IPCountry"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(country) && !country.Equals("XX", StringComparison.OrdinalIgnoreCase))
        {
            return CountryLabels.TryGetValue(country, out var label) ? label : $"{country.ToUpperInvariant()}";
        }

        var city = context.Request.Headers["X-Geo-City"].FirstOrDefault();
        var headerCountry = context.Request.Headers["X-Geo-Country"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(city) && !string.IsNullOrWhiteSpace(headerCountry))
        {
            return $"{city} ({headerCountry.ToUpperInvariant()})";
        }

        return "Unknown";
    }

    /// <summary>
    /// Produces a one-way anonymized fingerprint for an IP address.
    /// </summary>
    /// <param name="context">The current HTTP context.</param>
    /// <returns>A short anonymized source token, or null when no IP is available.</returns>
    public static string? AnonymizeSource(HttpContext context)
    {
        var ip = context.Connection.RemoteIpAddress?.ToString();
        if (string.IsNullOrWhiteSpace(ip))
        {
            return null;
        }

        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(ip));
        return Convert.ToHexString(hash)[..12];
    }
}
