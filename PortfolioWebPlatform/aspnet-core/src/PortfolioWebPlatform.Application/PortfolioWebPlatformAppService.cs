using System;
using System.Collections.Generic;
using System.Text;
using PortfolioWebPlatform.Localization;
using Volo.Abp.Application.Services;

namespace PortfolioWebPlatform;

/* Inherit your application services from this class.
 */
public abstract class PortfolioWebPlatformAppService : ApplicationService
{
    protected PortfolioWebPlatformAppService()
    {
        LocalizationResource = typeof(PortfolioWebPlatformResource);
    }
}
