namespace Portfolio.Api.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "Portfolio.Api";

    public string Audience { get; set; } = "Portfolio.Web";

    public string SigningKey { get; set; } = string.Empty;

    public int AccessTokenMinutes { get; set; } = 10080;
}
