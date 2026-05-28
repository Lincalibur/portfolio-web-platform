using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Entities;

namespace Portfolio.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<VisitorLead> VisitorLeads => Set<VisitorLead>();

    public DbSet<InteractionLog> InteractionLogs => Set<InteractionLog>();

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
    }
}
