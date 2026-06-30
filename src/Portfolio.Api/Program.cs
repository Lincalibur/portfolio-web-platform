using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Extensions;
using Portfolio.Api.Middleware;
using Portfolio.Api.Security;

if (args.Length >= 2 && args[0] == "hash-admin-password")
{
    Console.WriteLine(PasswordHasher.Hash(args[1]));
    return;
}

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.secrets.json", optional: true, reloadOnChange: true)
    .AddUserSecrets<Program>(optional: true);

builder.Services.AddPortfolioServices(builder.Configuration);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseHttpsRedirection();
app.UseMiddleware<TrafficAuditMiddleware>();
app.UseRateLimiter();
app.UseCors("Spa");
app.UseAuthentication();
app.UseAuthorization();

app.MapPortfolioEndpoints();

app.Run();
