using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTrafficLogging : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SecurityAuditTrails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ResourcePath = table.Column<string>(type: "TEXT", maxLength: 512, nullable: false),
                    IncidentType = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Severity = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    AnonymizedSource = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityAuditTrails", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrafficMetrics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Region = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    MetricType = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrafficMetrics", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditTrails_Timestamp",
                table: "SecurityAuditTrails",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_TrafficMetrics_Date_Region_MetricType",
                table: "TrafficMetrics",
                columns: new[] { "Date", "Region", "MetricType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SecurityAuditTrails");

            migrationBuilder.DropTable(
                name: "TrafficMetrics");
        }
    }
}
