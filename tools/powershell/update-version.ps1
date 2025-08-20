<#
  update-version.ps1
  - Replaces {{VER}} tokens anywhere in HTML.
  - Refreshes existing v=... OR adds it if missing for allowed local assets.
  - Attributes handled: href, src, and srcset (multi-URL).
  - Backs up each changed HTML file to .bak.<timestamp>.
  - Does NOT read/write _headers.

  Usage:
    pwsh .\update-version.ps1
    pwsh .\update-version.ps1 -DryRun
#>

param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# -----------------------------
# Config (adjust as desired)
# -----------------------------
# Version string format: YYYYMMDD-HHMMss
$ver = (Get-Date).ToString('yyyyMMdd-HHmmss')

# Add/update version ONLY on local assets
$onlyLocal = $true

# File types to touch
$allowedExtPattern = 'css|js|png|jpg|jpeg|webp|gif|svg'

# Optional directory allowlist for URL paths (regex; leave empty to allow any local path)
# Example: '^/(assets|css|js)/'
$allowedDirRegex = ''

# -----------------------------
# Helpers
# -----------------------------
function Is-LocalUrl([string]$u) {
  if (-not $onlyLocal) { return $true }
  if ($u -match '^(?:https?:)?//') { return $false }                 # absolute or protocol-relative
  if ($u -match '^(?:data:|mailto:|tel:|javascript:)') { return $false }
  return $true
}

function Has-AllowedExtension([string]$u) {
  $path = $u -replace '[?#].*$', ''                                  # strip query/fragment
  return ($path -match "\.($allowedExtPattern)$")
}

function Passes-AllowedDir([string]$u) {
  if ([string]::IsNullOrEmpty($allowedDirRegex)) { return $true }
  $path = $u -replace '[?#].*$', ''
  return ($path -match $allowedDirRegex)
}

function Upsert-Version([string]$u, [string]$v) {
  # separate fragment
  $fragment = ''
  if ($u -match '#') {
    $fragment = $u.Substring($u.IndexOf('#'))
    $u = $u.Substring(0, $u.IndexOf('#'))
  }
  # refresh existing v=
  if ($u -match '([?&])v=([0-9A-Za-z_\-\.]+)') {
    $u = [regex]::Replace($u, '([?&])v=([0-9A-Za-z_\-\.]+)', { param($m) $m.Groups[1].Value + 'v=' + $v })
    return $u + $fragment
  }
  # add v= (choose ? or &)
  if ($u -match '\?') { $u = $u + '&v=' + $v } else { $u = $u + '?v=' + $v }
  return $u + $fragment
}

# For srcset values: "url1 640w, url2 1280w, url3 2x"
function Process-Srcset([string]$val, [string]$v) {
  # Split on commas (candidates)
  $parts = $val -split ','
  $out = New-Object System.Collections.Generic.List[string]
  foreach ($raw in $parts) {
    $candidate = $raw.Trim()
    if ($candidate -eq '') { continue }

    # Split into URL and optional descriptor by the first whitespace
    $url = $candidate
    $desc = ''
    # If candidate contains whitespace, treat the first run as URL/descriptor boundary
    $m = [regex]::Match($candidate, '^\s*(\S+)(?:\s+(.+))?$')
    if ($m.Success) {
      $url = $m.Groups[1].Value
      $desc = $m.Groups[2].Value
    }

    # Decide whether to touch this URL
    if (Is-LocalUrl $url -and Has-AllowedExtension $url -and Passes-AllowedDir $url) {
      $newUrl = Upsert-Version $url $v
    } else {
      $newUrl = $url
    }

    if ([string]::IsNullOrEmpty($desc)) {
      $out.Add($newUrl)
    } else {
      # Preserve a single space between URL and descriptor
      $out.Add("$newUrl $desc")
    }
  }

  # Re-join with comma+space (common formatting)
  return ($out -join ', ')
}

# -----------------------------
# Main
# -----------------------------
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Version: $ver"
Write-Host "Root:    $repoRoot"
if ($DryRun) { Write-Host "Mode:   DRY RUN (no writes)" -ForegroundColor Yellow }

# HTML targets only (exclude _headers just in case)
$files = Get-ChildItem -Path $repoRoot -Recurse -File -Include *.html, *.htm |
  Where-Object { $_.Name -ne '_headers' }

# Attribute regexes
# 1) href/src: capture attribute name, quote, and the URL
$attrLinkRegex = [regex]::new('(?<attr>\b(?:href|src))\s*=\s*(?<q>["''])(?<url>[^"''\s>]+)\k<q>',
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

# 2) srcset: capture quote and full value (may contain spaces/commas)
$attrSrcsetRegex = [regex]::new('(?<attr>\bsrcset)\s*=\s*(?<q>["''])(?<val>[^"'']+)\k<q>',
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

$changedCount = 0

foreach ($f in $files) {
  $orig = Get-Content -LiteralPath $f.FullName -Raw
  $updated = $orig

  # Replace {{VER}} anywhere
  $updated = [regex]::Replace($updated, '\{\{VER\}\}', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $ver })

  # Pass 1: href/src (single URL)
  $updated = $attrLinkRegex.Replace($updated, {
    param($m)
    $attr = $m.Groups['attr'].Value
    $q    = $m.Groups['q'].Value
    $url  = $m.Groups['url'].Value

    if (-not (Is-LocalUrl $url)) { return $m.Value }
    if (-not (Has-AllowedExtension $url)) { return $m.Value }
    if (-not (Passes-AllowedDir $url)) { return $m.Value }

    $newUrl = Upsert-Version $url $ver
    if ($newUrl -eq $url) { return $m.Value }
    return "$attr=$q$newUrl$q"
  })

  # Pass 2: srcset (multi-URL)
  $updated = $attrSrcsetRegex.Replace($updated, {
    param($m)
    $attr = $m.Groups['attr'].Value
    $q    = $m.Groups['q'].Value
    $val  = $m.Groups['val'].Value

    $newVal = Process-Srcset $val $ver
    if ($newVal -eq $val) { return $m.Value }
    return "$attr=$q$newVal$q"
  })

  if ($updated -ne $orig) {
    $changedCount++
    if ($DryRun) {
      Write-Host "[DRY] Would update: $($f.FullName)"
      continue
    }
    $bakPath = "$($f.FullName).bak.$ver"
    Copy-Item -LiteralPath $f.FullName -Destination $bakPath -Force
    Set-Content -LiteralPath $f.FullName -Value $updated -NoNewline
    Write-Host "Updated: $($f.FullName)"
    Write-Host "Backup : $bakPath"
  }
}

if ($DryRun) {
  Write-Host "`nDRY RUN complete. Files that would change: $changedCount"
} else {
  Write-Host "`nDone. Files changed: $changedCount"
}
