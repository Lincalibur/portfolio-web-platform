using Portfolio.Api.Contracts;
using Portfolio.Api.Data;
using Portfolio.Api.Entities;

namespace Portfolio.Api.Services;

public class MetricsService(AppDbContext dbContext) : IMetricsService
{
    public async Task LogInteractionAsync(
        Guid? leadId,
        LogInteractionRequest request,
        CancellationToken cancellationToken = default)
    {
        dbContext.InteractionLogs.Add(new InteractionLog
        {
            Id = Guid.NewGuid(),
            LeadId = leadId,
            BlockId = request.BlockId,
            EventType = request.EventType,
            PayloadJson = request.PayloadJson,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
