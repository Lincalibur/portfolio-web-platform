namespace Portfolio.Api.Entities;

public class SecurityAuditTrail
{
    public Guid Id { get; set; }

    public DateTime Timestamp { get; set; }

    public required string ResourcePath { get; set; }

    public required string IncidentType { get; set; }

    public required string Severity { get; set; }

    public required string Status { get; set; }

    public string? AnonymizedSource { get; set; }
}
