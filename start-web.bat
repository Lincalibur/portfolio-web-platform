@echo off
title Portfolio Web
cd /d "%~dp0src\Portfolio.Web"
echo Starting Portfolio.Web (Vite)...
echo   App: http://localhost:5173
echo.
call npm run dev
pause
