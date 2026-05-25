using PortfolioWebPlatform.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace PortfolioWebPlatform.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class PortfolioWebPlatformController : AbpControllerBase
{
    protected PortfolioWebPlatformController()
    {
        LocalizationResource = typeof(PortfolioWebPlatformResource);
    }
}
