# peripherals\update-version.ps1
$ErrorActionPreference = 'Stop'

# Resolve repo root (this file lives in peripherals\ under the repo)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Version stamp (YYYYMMDD-HHmmSS) and minute bucket for bak folder
$ver   = Get-Date -Format 'yyyyMMdd-HHmmss'
$stamp = Get-Date -Format 'yyyyMMdd-HHmm'

# 1) Audit trail
$bakDir = Join-Path $root ("bak\" + $stamp)
if (-not (Test-Path $bakDir)) { New-Item -Path $bakDir -ItemType Directory | Out-Null }
"version set to ?v=$ver" | Set-Content -LiteralPath (Join-Path $bakDir 'version-used.txt') -Encoding UTF8

# 2) Snapshot current HTML before changes (skip bak\)
$liveHtml = Get-ChildItem -Path $root -Recurse -File -Include *.html |
            Where-Object { $_.FullName -notmatch '\\bak\\' }
foreach ($f in $liveHtml) {
  $dest = Join-Path $bakDir ($f.FullName.Substring($root.Length).TrimStart('\'))
  $destDir = Split-Path -Parent $dest
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
  Copy-Item -LiteralPath $f.FullName -Destination $dest
}

# 3) Normalize <script src="...script.js..."> and <link href="...style.css..."> to ?v=<ver>
#    - Fixes old $HASH form
#    - Replaces any existing ?v= or ?ver= value
#    - Preserves single/double quotes and original path
$patternJs = @'
src=(["'])([^"']*script\.js)(?:\?(?:v|ver)=[^"']+|\$[^"']+)?\1
'@

$patternCss = @'
href=(["'])([^"']*style\.css)(?:\?(?:v|ver)=[^"']+|\$[^"']+)?\1
'@

$changed = 0
foreach ($f in $liveHtml) {
  $p = $f.FullName
  $text = Get-Content -Raw -LiteralPath $p

  $new = [regex]::Replace($text, $patternJs, {
    param($m)
    $q = $m.Groups[1].Value      # quote
    $s = $m.Groups[2].Value      # path ending in script.js
    'src=' + $q + $s + '?v=' + $ver + $q
  })

  $new = [regex]::Replace($new, $patternCss, {
    param($m)
    $q = $m.Groups[1].Value      # quote
    $s = $m.Groups[2].Value      # path ending in style.css
    'href=' + $q + $s + '?v=' + $ver + $q
  })

  if ($new -ne $text) {
    Set-Content -LiteralPath $p -Value $new -Encoding UTF8
    Write-Host "Updated: $p"
    $changed++
  }
}

Write-Host ("Done. Updated {0} file(s). Version = {1}" -f $changed, $ver) -ForegroundColor Green
