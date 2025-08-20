@echo off
setlocal

REM === Settings ===
set "PROJECT_DIR=C:\Users\Public\Documents\Web Design\aircraft-delivery-site"
set "NPX_CMD=C:\Node\node-v22.17.0-win-x64\npx.cmd"

REM === Go to project ===
cd /d "%PROJECT_DIR%" || (echo [ERROR] Project folder not found & pause & exit /b 1)

REM === Run Netlify dev ===
echo [INFO] Starting Netlify Dev server...
call "%NPX_CMD%" netlify dev

echo.
echo [INFO] Dev server stopped.
pause
