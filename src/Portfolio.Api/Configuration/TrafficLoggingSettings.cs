namespace Portfolio.Api.Configuration;

public class TrafficLoggingSettings
{
    public const string SectionName = "TrafficLogging";

    public int RetentionDays { get; set; } = 7;

    public string[] SuspiciousDirectories { get; set; } =
    [
        "/.env",
        "/admin",
        "/wp-admin",
        "/wp-login.php",
        "/config.php",
        "/actuator"
    ];
}
