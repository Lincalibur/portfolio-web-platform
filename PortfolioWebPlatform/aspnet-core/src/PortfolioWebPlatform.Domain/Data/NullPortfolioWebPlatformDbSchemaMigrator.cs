using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace PortfolioWebPlatform.Data;

/* This is used if database provider does't define
 * IPortfolioWebPlatformDbSchemaMigrator implementation.
 */
public class NullPortfolioWebPlatformDbSchemaMigrator : IPortfolioWebPlatformDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
