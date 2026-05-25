using PortfolioWebPlatform.Samples;
using Xunit;

namespace PortfolioWebPlatform.EntityFrameworkCore.Applications;

[Collection(PortfolioWebPlatformTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<PortfolioWebPlatformEntityFrameworkCoreTestModule>
{

}
