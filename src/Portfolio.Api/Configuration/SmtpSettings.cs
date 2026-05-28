namespace Portfolio.Api.Configuration;

public class SmtpSettings
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = string.Empty;

    public int Port { get; set; } = 587;

    public string? UserName { get; set; }

    public string? Password { get; set; }

    public string FromAddress { get; set; } = string.Empty;

    public string FromDisplayName { get; set; } = "Portfolio";

    public bool UseStartTls { get; set; } = true;
}
