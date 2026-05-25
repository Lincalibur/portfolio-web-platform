using Volo.Abp.Settings;

namespace PortfolioWebPlatform.Settings;

public class PortfolioWebPlatformSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(PortfolioWebPlatformSettings.MySetting1));
    }
}
