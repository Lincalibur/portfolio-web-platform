$root = Split-Path $PSScriptRoot -Parent
Set-Location (Join-Path $root 'src\Portfolio.Web')

Write-Host 'Starting Portfolio.Web (Vite)...' -ForegroundColor Cyan
Write-Host '  App: http://localhost:5173' -ForegroundColor DarkGray
Write-Host ''

npm run dev
