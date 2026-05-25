using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace PortfolioWebPlatform;

[Dependency(ReplaceServices = true)]
public class PortfolioWebPlatformBrandingProvider : DefaultBrandingProvider
{
    public override string AppName => "PortfolioWebPlatform";
}
