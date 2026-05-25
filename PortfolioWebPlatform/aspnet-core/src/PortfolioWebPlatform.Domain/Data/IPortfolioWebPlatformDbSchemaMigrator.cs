using System.Threading.Tasks;

namespace PortfolioWebPlatform.Data;

public interface IPortfolioWebPlatformDbSchemaMigrator
{
    Task MigrateAsync();
}
