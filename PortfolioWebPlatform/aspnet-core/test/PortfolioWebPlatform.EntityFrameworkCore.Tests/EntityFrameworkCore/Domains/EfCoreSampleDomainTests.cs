using PortfolioWebPlatform.Samples;
using Xunit;

namespace PortfolioWebPlatform.EntityFrameworkCore.Domains;

[Collection(PortfolioWebPlatformTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<PortfolioWebPlatformEntityFrameworkCoreTestModule>
{

}
