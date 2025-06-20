@echo off
REM Usage: gitdeploy your message here (no quotes needed)

:: Combine all arguments into a single string
set msg=%*
git add .
git commit -m "%msg%"
git push
