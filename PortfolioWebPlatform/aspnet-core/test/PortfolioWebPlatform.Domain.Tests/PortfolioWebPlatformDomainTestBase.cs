using Volo.Abp.Modularity;

namespace PortfolioWebPlatform;

/* Inherit from this class for your domain layer tests. */
public abstract class PortfolioWebPlatformDomainTestBase<TStartupModule> : PortfolioWebPlatformTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
