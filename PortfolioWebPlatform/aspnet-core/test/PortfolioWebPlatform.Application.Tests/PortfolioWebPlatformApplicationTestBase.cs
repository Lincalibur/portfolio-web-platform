using Volo.Abp.Modularity;

namespace PortfolioWebPlatform;

public abstract class PortfolioWebPlatformApplicationTestBase<TStartupModule> : PortfolioWebPlatformTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
