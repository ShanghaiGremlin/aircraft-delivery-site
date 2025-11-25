param(
  [string]$Root = ".",
  [string]$JarPath = "",
  [switch]$ShowSectionHeadingWarnings
)

# UTF-8 output (avoid mojibake)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$ErrorActionPreference = "Stop"

function Get-ScriptDir {
  if ($PSScriptRoot) { return $PSScriptRoot }
  if ($MyInvocation.MyCommand.Path) { return (Split-Path -Parent $MyInvocation.MyCommand.Path) }
  $def = $MyInvocation.MyCommand.Definition
  if ($def -and (Test-Path $def)) { return (Split-Path -Parent (Resolve-Path $def)) }
  return (Get-Location).Path
}

# Resolve root & jar
$rootPath  = Resolve-Path $Root
$scriptDir = Get-ScriptDir
if ([string]::IsNullOrWhiteSpace($JarPath)) { $JarPath = Join-Path $scriptDir "vnu.jar" }
$jarItem = Get-Item -LiteralPath $JarPath -ErrorAction SilentlyContinue
if (-not $jarItem) { Write-Output "ERROR: vnu.jar not found at '$JarPath'."; exit 0 }
$jarPath = $jarItem.FullName

# Collect HTML files (ignore node_modules, bak, *.bak.*)
$files = Get-ChildItem -Path $rootPath -Include *.html,*.htm -Recurse -File -Force |
  Where-Object {
    $_.FullName -notmatch "(^|\\)(node_modules|bak)(\\|$)" -and
    $_.Name -notlike "*.bak.*"
  }
if (-not $files) { Write-Output "No HTML files found under $rootPath."; exit 0 }

# Convert v.Nu line -> GCC-style "file:line:col: severity: message"
function To-GccLine {
  param(
    [string]$line,
    [bool]$showWarn = $false
  )
  if (-not $line) { return $null }
  $t = $line.Trim()
  if (-not $t) { return $null }

  # Strip quotes
  $t = $t -replace '^[\"“”]', '' -replace '[\"“”]$', ''

  # file:/C:/... -> C:\...
  $t = $t -replace '^file:/+([A-Za-z]):', '${1}:'
  if ($t -match '^(.*?):(\d)') {
    $left = $Matches[1] -replace '/', '\'
    try { $left = [uri]::UnescapeDataString($left) } catch {}
    $t = $left + $t.Substring($Matches[1].Length)
  }

  # "info warning:" -> "warning:"
  $t = $t -replace ':\s*info\s+warning:\s*', ': warning: '

  # Parse: file:line(.col)(-endLine.endCol)?: severity: message
  $m = [regex]::Match($t, '^(.+?):(\d+)(?:\.(\d+))?(?:-(\d+)\.(\d+))?:\s+(error|warning):\s+(.*)$')
  if (-not $m.Success) { return $null }

  $file = $m.Groups[1].Value
  $lineNo = $m.Groups[2].Value
  $col = "1"
  if ($m.Groups[3].Success) { $col = $m.Groups[3].Value }
  $sev  = $m.Groups[6].Value.ToLower()
  $msg  = $m.Groups[7].Value

  if (-not $showWarn -and $msg -match 'Section lacks heading') { return $null }

  return ("{0}:{1}:{2}: {3}: {4}" -f $file, $lineNo, $col, $sev, $msg)
}

# Run v.Nu per file; capture both streams; emit GCC lines
$show = [bool]$ShowSectionHeadingWarnings
foreach ($f in $files) {
  $prevEA = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $raw = & java -Dfile.encoding=UTF-8 -jar $jarPath --format gnu $f.FullName 2>&1
  $ErrorActionPreference = $prevEA

  foreach ($r in $raw) {
    $emit = To-GccLine -line $r -showWarn:$show
    if ($emit) { Write-Output $emit }
  }
}

exit 0
