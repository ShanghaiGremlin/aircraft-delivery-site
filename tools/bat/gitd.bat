@echo off
setlocal
rem Always operate from the repo root (folder containing this .bat)
cd /d "%~dp0"

echo.
echo [gitd] Running update-version.ps1...
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\powershell\update-version.ps1" -Root "%CD%"
if errorlevel 1 (
  echo [gitd] ERROR: update-version.ps1 failed. Aborting.
  exit /b 1
)

echo [gitd] Tripwire check...
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\powershell\tripwire.ps1"
if errorlevel 1 (
  echo [gitd] ERROR: tripwire.ps1 failed. Aborting.
  exit /b 1
)

echo [gitd] Staging changes...
git add -A

echo [gitd] Commit and push...
git commit -m "Deploy %date% %time%"
git push

echo [gitd] Done.
pause
