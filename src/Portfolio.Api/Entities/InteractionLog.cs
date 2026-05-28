namespace Portfolio.Api.Entities;

public class InteractionLog
{
    public Guid Id { get; set; }

    public Guid? LeadId { get; set; }

    public VisitorLead? Lead { get; set; }

    public required string BlockId { get; set; }

    public required string EventType { get; set; }

    public string? PayloadJson { get; set; }

    public DateTime CreatedAt { get; set; }
}
