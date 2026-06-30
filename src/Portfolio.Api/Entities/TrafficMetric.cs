namespace Portfolio.Api.Entities;

public class TrafficMetric
{
    public Guid Id { get; set; }

    public DateOnly Date { get; set; }

    public required string Region { get; set; }

    public required string MetricType { get; set; }

    public int Count { get; set; }
}
