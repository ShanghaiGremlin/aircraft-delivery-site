@echo off
cd /d "%~dp0"
echo.
echo 📁 Adding updated assets...
git add assets/

echo.
echo 💬 Committing changes...
git commit -m "Update image assets"

echo.
echo 🚀 Pushing to GitHub...
git push

echo.
echo ✅ Done! Your site will deploy via Netlify shortly.
pause
