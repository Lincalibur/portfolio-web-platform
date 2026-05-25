using PortfolioWebPlatform.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace PortfolioWebPlatform.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(PortfolioWebPlatformEntityFrameworkCoreModule),
    typeof(PortfolioWebPlatformApplicationContractsModule)
    )]
public class PortfolioWebPlatformDbMigratorModule : AbpModule
{
}
