namespace Portfolio.Api.Configuration;

public class AdminSettings
{
    public const string SectionName = "Admin";

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public int AccessTokenMinutes { get; set; } = 480;
}
