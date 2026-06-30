$root = Split-Path $PSScriptRoot -Parent
Set-Location (Join-Path $root 'src\Portfolio.Api')

Write-Host 'Starting Portfolio.Api...' -ForegroundColor Cyan
Write-Host '  HTTP:  http://localhost:5180' -ForegroundColor DarkGray
Write-Host '  HTTPS: https://localhost:7262' -ForegroundColor DarkGray
Write-Host '  OTP (no SMTP): watch this window after gateway submit' -ForegroundColor DarkGray
Write-Host ''

dotnet run
