@echo off

:: === Inject Node.js into PATH ===
set "PATH=C:\node\node-v22.17.0-win-x64;%PATH%"

:: === Kill any process using port 3999 ===
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3999') do (
    echo Killing PID %%a on port 3999...
    taskkill /F /PID %%a >nul 2>&1
)

:: === Navigate to project root ===
cd /d "C:\Users\Public\Documents\Web Design\aircraft-delivery-site"

:: === Run Netlify Dev ===
call .\node_modules\.bin\netlify.cmd dev

pause



