using Volo.Abp.Modularity;

namespace PortfolioWebPlatform;

[DependsOn(
    typeof(PortfolioWebPlatformDomainModule),
    typeof(PortfolioWebPlatformTestBaseModule)
)]
public class PortfolioWebPlatformDomainTestModule : AbpModule
{

}
