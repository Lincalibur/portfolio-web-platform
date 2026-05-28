namespace Portfolio.Api.Entities;

public class VisitorLead
{
    public Guid Id { get; set; }

    public required string FullName { get; set; }

    public required string Email { get; set; }

    public string? Company { get; set; }

    public string? OtpHash { get; set; }

    public DateTime? OtpExpiresAt { get; set; }

    public bool IsVerified { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? VerifiedAt { get; set; }

    public ICollection<InteractionLog> InteractionLogs { get; set; } = [];
}
