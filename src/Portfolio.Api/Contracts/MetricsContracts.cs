namespace Portfolio.Api.Contracts;

public record LogInteractionRequest(string BlockId, string EventType, string? PayloadJson);

public record HostStatsResponse(double CpuPercent, double MemoryUsedMb, double MemoryTotalMb, IReadOnlyList<string> ContainerStatuses);
