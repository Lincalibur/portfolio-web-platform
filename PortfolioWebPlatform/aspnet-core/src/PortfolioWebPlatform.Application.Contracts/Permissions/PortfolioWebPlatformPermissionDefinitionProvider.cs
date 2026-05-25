using PortfolioWebPlatform.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace PortfolioWebPlatform.Permissions;

public class PortfolioWebPlatformPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(PortfolioWebPlatformPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(PortfolioWebPlatformPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<PortfolioWebPlatformResource>(name);
    }
}
