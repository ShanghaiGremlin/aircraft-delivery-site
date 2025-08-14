@echo off
setlocal EnableDelayedExpansion

REM ===================== CONFIG (WITH SPACE IN PATH) =====================
set "ROOTDIR=C:\Users\Public\Documents\Web Design\aircraft-delivery-site\"
REM ======================================================================

echo.
echo [1/4] Preparing backup folder and random version string...

REM --- Build timestamp: YYYYMMDD-HHMM (safe for folder names)
for /f %%A in ('powershell -NoProfile -Command "(Get-Date).ToString('yyyyMMdd-HHmm')"') do set "STAMP=%%A"

REM --- Backup root and per-run folder (under ROOTDIR\bak\YYYYMMDD-HHMM)
set "BAKROOT=%ROOTDIR%bak"
set "BAKDIR=%BAKROOT%\%STAMP%"
if not exist "%BAKDIR%" mkdir "%BAKDIR%"

REM --- Generate 10-char smush (A-Za-z0-9) via PowerShell
for /f %%A in ('powershell -NoProfile -Command "$c=('a'..'z')+('A'..'Z')+('0'..'9'); -join (1..10 | %%{ $c | Get-Random })"') do set "SMUSH=%%A"

echo     Root:     "%ROOTDIR%"
echo     Backup:   "%BAKDIR%"
echo     Version:  %SMUSH%
echo.

echo [2/4] Preview files that will be scanned (HTML/CSS)...
powershell -NoProfile -Command ^
  "$root = '%ROOTDIR%';" ^
  "Get-ChildItem -Path $root -Recurse -Include *.html,*.css -File |" ^
  "  Where-Object { $_.FullName -notlike (Join-Path $root 'bak*') } |" ^
  "  Select-Object -ExpandProperty FullName"

echo.
pause

echo [3/4] Backing up originals and updating ?v= to %SMUSH% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$Root = '%ROOTDIR%';" ^
  "$BackupRoot = Join-Path $Root 'bak';" ^
  "$Stamp = '%STAMP%';" ^
  "$BackupDir = Join-Path $BackupRoot $Stamp;" ^
  "$Smush = '%SMUSH%';" ^
  "$pattern = '(\?v=)[^""''>\s]+';" ^
  "" ^
  "Get-ChildItem -Path $Root -Recurse -Include *.html,*.css -File |" ^
  "  Where-Object { $_.FullName -notlike (Join-Path $Root 'bak*') } |" ^
  "  ForEach-Object {" ^
  "    $src = $_.FullName;" ^
  "    $rel = $src.Substring($Root.Length).TrimStart('\');" ^
  "    $dest = Join-Path $BackupDir $rel;" ^
  "    $destDir = Split-Path $dest -Parent;" ^
  "    New-Item -Force -ItemType Directory -Path $destDir | Out-Null;" ^
  "    Copy-Item -LiteralPath $src -Destination $dest;" ^
  "    $text = Get-Content -Raw -LiteralPath $src;" ^
  "    $new  = [regex]::Replace($text, $pattern, '$1' + $Smush);" ^
  "    if ($new -ne $text) { Set-Content -LiteralPath $src -Value $new -Encoding UTF8 }" ^
  "  };" ^
  "" ^
  "Set-Content -Path (Join-Path $BackupDir 'version-used.txt') -Value $Smush -Encoding UTF8"

echo.
echo [4/4] Verifying changes...
powershell -NoProfile -Command ^
  "Select-String -Path '%ROOTDIR%\**\*.html','%ROOTDIR%\**\*.css' -Pattern '\?v=%SMUSH%' | Measure-Object | Select-Object -ExpandProperty Count"

echo.
echo Done. A per-run backup was saved under:
echo   "%BAKDIR%"
echo (Backups are unlimited; delete old ones whenever you like.)
echo.
pause
endlocal
