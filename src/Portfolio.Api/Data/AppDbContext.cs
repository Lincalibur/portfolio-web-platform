using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Entities;

namespace Portfolio.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<VisitorLead> VisitorLeads => Set<VisitorLead>();

    public DbSet<InteractionLog> InteractionLogs => Set<InteractionLog>();

    public DbSet<TrafficMetric> TrafficMetrics => Set<TrafficMetric>();

    public DbSet<SecurityAuditTrail> SecurityAuditTrails => Set<SecurityAuditTrail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VisitorLead>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(320);
            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.OtpHash).HasMaxLength(128);
        });

        modelBuilder.Entity<InteractionLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BlockId).HasMaxLength(64);
            entity.Property(e => e.EventType).HasMaxLength(64);
            entity.HasOne(e => e.Lead)
                .WithMany(l => l.InteractionLogs)
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TrafficMetric>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Region).HasMaxLength(128);
            entity.Property(e => e.MetricType).HasMaxLength(32);
            entity.HasIndex(e => new { e.Date, e.Region, e.MetricType }).IsUnique();
        });

        modelBuilder.Entity<SecurityAuditTrail>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ResourcePath).HasMaxLength(512);
            entity.Property(e => e.IncidentType).HasMaxLength(64);
            entity.Property(e => e.Severity).HasMaxLength(32);
            entity.Property(e => e.Status).HasMaxLength(64);
            entity.Property(e => e.AnonymizedSource).HasMaxLength(64);
            entity.HasIndex(e => e.Timestamp);
        });
    }
}
