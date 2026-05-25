using Volo.Abp.Modularity;

namespace PortfolioWebPlatform;

[DependsOn(
    typeof(PortfolioWebPlatformApplicationModule),
    typeof(PortfolioWebPlatformDomainTestModule)
)]
public class PortfolioWebPlatformApplicationTestModule : AbpModule
{

}
