@echo off
echo Launching Portfolio API and Frontend in separate PowerShell windows...
echo.

start "Portfolio API" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\start-api.ps1"
timeout /t 2 /nobreak >nul
start "Portfolio Web" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\start-web.ps1"

echo Done. Two PowerShell windows should be open.
echo   API: http://localhost:5180/health
echo   App: http://localhost:5173
echo.
pause
