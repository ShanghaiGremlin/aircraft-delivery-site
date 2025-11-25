@echo off
:: gitf.bat — Full deploy: adds, commits, and pushes all changes

git add -A
git commit -m "Full deploy %date% %time%"
git push
