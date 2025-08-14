@echo off
setlocal
REM Run the PowerShell implementation (handles spaces in paths)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-version.ps1"
exit /b %ERRORLEVEL%
