<#  Run-Vnu-Filtered.ps1
    Validates HTML files under -Root with vnu.jar, excluding repo junk.
    Designed for VS Code Tasks + Problem Matcher (GNU format).
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$Root,

  [Parameter(Mandatory = $true)]
  [string]$JarPath,

  # Optional custom filter file; defaults to "<root>\.vnu-filter" if it exists.
  [string]$FilterFile
)

# --- Safety & encoding -------------------------------------------------------
$ErrorActionPreference = 'Stop'

# Force UTF-8 I/O to avoid mojibake in Terminal/Problems
try { chcp 65001 | Out-Null } catch {}
[Console]::InputEncoding  = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding           = [Console]::OutputEncoding

# --- Inputs sanity -----------------------------------------------------------
if (-not (Test-Path -LiteralPath $Root))   { Write-Error "[VNU] Root not found: $Root";   exit 2 }
if (-not (Test-Path -LiteralPath $JarPath)) { Write-Error "[VNU] vnu.jar not found: $JarPath"; exit 2 }

if (-not $FilterFile) {
  $defaultFilter = Join-Path $Root '.vnu-filter'
  if (Test-Path -LiteralPath $defaultFilter) { $FilterFile = $defaultFilter }
}

Write-Host "[VNU] Root: $Root"
Write-Host "[VNU] Jar : $JarPath"
if ($FilterFile) { Write-Host "[VNU] Filter: $FilterFile" }

# --- Collect files (HTML only) ----------------------------------------------
# Exclude common junk: .git, node_modules, build outputs, caches, and any \bak\ segment; skip *.bak files.
$exclude = '(\\|/)(\.git|node_modules|dist|build|out|\.cache|bak)(\\|/)'

$files = Get-ChildItem -Path $Root -Recurse -File -Include *.html,*.htm,*.xhtml |
  Where-Object {
    $_.FullName -notmatch $exclude -and $_.Name -notlike '*.bak'
  } |
  Select-Object -ExpandProperty FullName

if (-not $files -or $files.Count -eq 0) {
  Write-Error "[VNU] No HTML files found after excludes under: $Root"
  exit 3
}

Write-Host "[VNU] Will validate $($files.Count) files"

# --- Build Java args safely (no token splitting) ----------------------------
$javaArgs = @(
  '-Dfile.encoding=UTF-8',
  '-jar', $JarPath,
  '--format', 'gnu',
  '--skip-non-html'
)

if ($FilterFile) {
  $javaArgs += @('--filterfile', $FilterFile)
}

# Pass file list directly (reliable on PS 5.1; avoids @args-file quirks)
$javaArgs += $files

# --- Execute vnu; print its GNU-format output verbatim ----------------------
& java @javaArgs
$exitCode = $LASTEXITCODE
Write-Host "[VNU] Exit code: $exitCode"
exit $exitCode
