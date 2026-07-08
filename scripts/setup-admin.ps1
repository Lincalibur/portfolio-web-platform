# Generates a PBKDF2 password hash and stores admin credentials in dotnet user-secrets.
# Credentials are never written to appsettings or committed to git.
param(
    [Parameter(Mandatory = $true)]
    [string]$Username,

    [Parameter(Mandatory = $true)]
    [string]$Password
)

$ErrorActionPreference = 'Stop'
$apiProject = Join-Path $PSScriptRoot '..\src\Portfolio.Api'

if (-not (Test-Path $apiProject)) {
    throw "Portfolio.Api project not found at $apiProject"
}

function Get-AdminPasswordHash {
    param([string]$ProjectPath, [string]$PlainPassword)

    $output = & dotnet run --project $ProjectPath --no-build -- hash-admin-password "$PlainPassword" 2>&1 |
        ForEach-Object { "$_" }

    $hash = $output |
        Where-Object { $_ -match '^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$' } |
        Select-Object -Last 1

    return "$hash".Trim()
}

Write-Host 'Building API to generate password hash...'
dotnet build $apiProject | Out-Null

$hash = Get-AdminPasswordHash -ProjectPath $apiProject -PlainPassword $Password
if ([string]::IsNullOrWhiteSpace($hash)) {
    throw 'Failed to generate password hash.'
}

Push-Location $apiProject
try {
    dotnet user-secrets init | Out-Null
    dotnet user-secrets set "Admin:Username" "$Username"
    dotnet user-secrets set "Admin:PasswordHash" "$hash"

    $secretsJsonPath = Join-Path $apiProject 'appsettings.secrets.json'
    @{
        Admin = @{
            Username           = $Username
            PasswordHash       = $hash
            AccessTokenMinutes = 480
        }
    } | ConvertTo-Json | Set-Content -Path $secretsJsonPath -Encoding utf8

    $secrets = dotnet user-secrets list | Out-String
    if ($secrets -notmatch 'Admin:PasswordHash\s*=') {
        throw 'Admin:PasswordHash was not saved. Re-run the script after pulling the latest setup-admin.ps1 fix.'
    }

    Write-Host "Admin credentials stored in user secrets for $Username."
    Write-Host "Backup written to src/Portfolio.Api/appsettings.secrets.json (gitignored)."
    Write-Host 'Open http://localhost:5173/admin/login after starting the app.'
}
finally {
    Pop-Location
}
