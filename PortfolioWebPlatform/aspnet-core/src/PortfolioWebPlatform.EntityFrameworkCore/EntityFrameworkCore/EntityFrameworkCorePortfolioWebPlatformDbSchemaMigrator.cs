using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PortfolioWebPlatform.Data;
using Volo.Abp.DependencyInjection;

namespace PortfolioWebPlatform.EntityFrameworkCore;

public class EntityFrameworkCorePortfolioWebPlatformDbSchemaMigrator
    : IPortfolioWebPlatformDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCorePortfolioWebPlatformDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the PortfolioWebPlatformDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<PortfolioWebPlatformDbContext>()
            .Database
            .MigrateAsync();
    }
}
