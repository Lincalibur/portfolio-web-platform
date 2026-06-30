@echo off
title Portfolio API
cd /d "%~dp0src\Portfolio.Api"
echo Starting Portfolio.Api...
echo   HTTP:  http://localhost:5180
echo   HTTPS: https://localhost:7262
echo.
dotnet run
pause
