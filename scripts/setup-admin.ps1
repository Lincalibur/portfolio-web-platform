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

Write-Host 'Building API to generate password hash...'
$hash = dotnet run --project $apiProject --no-build -- hash-admin-password $Password 2>$null
if (-not $hash) {
    dotnet build $apiProject | Out-Null
    $hash = dotnet run --project $apiProject --no-build -- hash-admin-password $Password
}

if ([string]::IsNullOrWhiteSpace($hash)) {
    throw 'Failed to generate password hash.'
}

Push-Location $apiProject
try {
    dotnet user-secrets init | Out-Null
    dotnet user-secrets set 'Admin:Username' $Username
    dotnet user-secrets set 'Admin:PasswordHash' $hash.Trim()
    Write-Host "Admin credentials stored in user secrets for $Username."
    Write-Host 'Open http://localhost:5173/admin/login after starting the app.'
}
finally {
    Pop-Location
}
