# peripherals\update-version.ps1
# -------------------------------------------------------------------
# What this does
# - Computes a version string (?v=<timestamp>) once per run
# - Backs up current HTML + _headers into /bak/<YYYYMMDD-HHmm>/
# - Updates HTML to use ?v=<ver> for:
#     - /script.js    (in src= or href=)
#     - /styles.css or /style.css (in href=)
#     - /wv.js        (in src= or href=)  [optional file you added]
# - Writes _headers from _headers.tpl by replacing {{VER}} with <ver>
#   (falls back to in-place replace if _headers.tpl is missing and
#    live _headers contains {{VER}})
# -------------------------------------------------------------------

$ErrorActionPreference = 'Stop'

# Resolve repo root (this file lives in peripherals\ under the repo)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Version stamp (YYYYMMDD-HHmmss) and minute bucket for bak folder
$ver   = Get-Date -Format 'yyyyMMdd-HHmmss'
$stamp = Get-Date -Format 'yyyyMMdd-HHmm'

# 1) Audit trail
$bakDir = Join-Path $root ("bak\" + $stamp)
if (-not (Test-Path $bakDir)) { New-Item -Path $bakDir -ItemType Directory | Out-Null }
"version set to ?v=$ver" | Set-Content -LiteralPath (Join-Path $bakDir 'version-used.txt') -Encoding UTF8

# 2) Snapshot current HTML before changes (skip bak\)
$liveHtml = Get-ChildItem -Path $root -Recurse -File -Include *.html,*.htm |
            Where-Object { $_.FullName -notmatch '\\bak\\' }
foreach ($f in $liveHtml) {
  $dest = Join-Path $bakDir ($f.FullName.Substring($root.Length).TrimStart('\'))
  $destDir = Split-Path -Parent $dest
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
  Copy-Item -LiteralPath $f.FullName -Destination $dest
}

# 2.5) Stamp _headers with the same version (using a {{VER}} placeholder)
$headersTpl = Join-Path $root "_headers.tpl"   # template you maintain
$headersOut = Join-Path $root "_headers"       # file Netlify reads

# Backup live _headers into bak\
if (Test-Path $headersOut) {
  Copy-Item -LiteralPath $headersOut -Destination (Join-Path $bakDir "_headers") -ErrorAction SilentlyContinue
}

if (Test-Path $headersTpl) {
  (Get-Content -Raw $headersTpl) -replace '\{\{VER\}\}', $ver |
    Set-Content -Encoding UTF8 $headersOut
} elseif (Test-Path $headersOut) {
  $h = Get-Content -Raw $headersOut
  if ($h -match '\{\{VER\}\}') {
    ($h -replace '\{\{VER\}\}', $ver) | Set-Content -Encoding UTF8 $headersOut
  } else {
    Write-Warning "Skipping header stamping: no _headers.tpl and no {{VER}} placeholder in _headers."
  }
}

# 3) Normalize asset version strings in HTML
#    - Replaces any existing ?v= or ?ver= (or legacy $HASH) on targets
#    - Matches both src= and href= for .js targets (covers <script> and <link rel=preload as=script>)
#    - Matches href= for CSS (style.css or styles.css)
$patternJS  = @'
(?i)(?:src|href)=(["'])([^"'']*?script\.js)(?:\?(?:v|ver)=[^"'']+|\$[^"'']+)?\1
'@

$patternWV  = @'
(?i)(?:src|href)=(["'])([^"'']*?wv\.js)(?:\?(?:v|ver)=[^"'']+|\$[^"'']+)?\1
'@

$patternCSS = @'
(?i)href=(["'])([^"'']*?styles?\.css)(?:\?(?:v|ver)=[^"'']+|\$[^"'']+)?\1
'@

$changed = 0
foreach ($f in $liveHtml) {
  $p = $f.FullName
  $text = Get-Content -Raw -LiteralPath $p
  $new = $text

  # script.js in src= or href=
  $new = [regex]::Replace($new, $patternJS, {
    param($m)
    $q = $m.Groups[1].Value   # quote
    $s = $m.Groups[2].Value   # path ending in script.js
    ($m.Value -replace [regex]::Escape($m.Value), ('src=' + $q + $s + '?v=' + $ver + $q)) # replaced attr; name normalized to src=
  })

  # wv.js in src= or href= (optional file)
  $new = [regex]::Replace($new, $patternWV, {
    param($m)
    $q = $m.Groups[1].Value
    $s = $m.Groups[2].Value
    ($m.Value -replace [regex]::Escape($m.Value), ('src=' + $q + $s + '?v=' + $ver + $q))
  })

  # styles.css or style.css in href=
  $new = [regex]::Replace($new, $patternCSS, {
    param($m)
    $q = $m.Groups[1].Value
    $s = $m.Groups[2].Value
    'href=' + $q + $s + '?v=' + $ver + $q
  })

  if ($new -ne $text) {
    Set-Content -LiteralPath $p -Value $new -Encoding UTF8
    Write-Host "Updated: $p"
    $changed++
  }
}

Write-Host ("Done. Updated {0} file(s). Version = {1}" -f $changed, $ver) -ForegroundColor Green

# -------------------------------------------------------------------
# _headers.tpl example (put this next to _headers; script replaces {{VER}})
#
# /*
#   Link: </styles.css?v={{VER}}>; rel=preload; as=style
#   Link: </script.js?v={{VER}}>; rel=preload; as=script
#   # (optional) gate one hero preload per device class:
#   # Link: </assets/desktop/desk-index-hero-1400w.avif?v={{VER}}>; rel=preload; as=image; media="(min-width: 1400px)"
#   # Link: </assets/mobile/mob-index-mobilehero-640w.jpg?v={{VER}}>; rel=preload; as=image; media="(max-width: 1399px)"
# -------------------------------------------------------------------
