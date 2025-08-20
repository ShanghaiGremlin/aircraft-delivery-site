<#
  update-version.ps1
  - Replaces {{VER}} tokens anywhere in HTML.
  - Adds or refreshes v=... for allowed local assets in href, src, and srcset.
  - Backs up each changed HTML file to .bak.<timestamp>.
  - Does NOT read/write _headers.

  Usage:
    # from repo root
    .\tools\powershell\update-version.ps1 -Root .

    # preview only
    .\tools\powershell\update-version.ps1 -Root . -DryRun
#>

[CmdletBinding()]
param(
  [switch]$DryRun,
  [string]$Root
)

$ErrorActionPreference = 'Stop'

# -----------------------------
# Config (adjust as desired)
# -----------------------------
# Version string format: YYYYMMDD-HHmmss
$ver = (Get-Date).ToString('yyyyMMdd-HHmmss')

# Only touch local assets (skip http(s)://, //, data:, mailto:, tel:, javascript:)
$onlyLocal = $true

# File types to version
$allowedExtPattern = 'css|js|png|jpg|jpeg|webp|gif|svg'

# Optional allowlist of URL paths (regex). Leave empty to allow any local path.
# Example: '^/(assets|css|js)/'
$allowedDirRegex = ''

# -----------------------------
# Resolve root (default: caller's CWD)
# -----------------------------
$invokedAt  = (Get-Location).Path      # caller's working directory
$scriptDir  = $PSScriptRoot            # folder containing this script
$scriptPath = $PSCommandPath

if ($PSBoundParameters.ContainsKey('Root') -and $Root) {
  $repoRoot = (Resolve-Path -LiteralPath $Root).Path
} else {
  $repoRoot = $invokedAt
}

Write-Host "Script: $scriptPath"
Write-Host "CWD:    $invokedAt"
Write-Host "Root:   $repoRoot"
if ($DryRun) { Write-Host "Mode:   DRY RUN (no writes)" -ForegroundColor Yellow }

# -----------------------------
# Helpers
# -----------------------------
function Is-LocalUrl([string]$u) {
  if (-not $onlyLocal) { return $true }
  if ($u -match '^(?:https?:)?//') { return $false }
  if ($u -match '^(?:data:|mailto:|tel:|javascript:)') { return $false }
  return $true
}

function Has-AllowedExtension([string]$u) {
  $path = $u -replace '[?#].*$', ''
  return ($path -match "\.($allowedExtPattern)$")
}

function Passes-AllowedDir([string]$u) {
  if ([string]::IsNullOrEmpty($allowedDirRegex)) { return $true }
  $path = $u -replace '[?#].*$', ''
  return ($path -match $allowedDirRegex)
}

function Upsert-Version([string]$u, [string]$v) {
  # Separate fragment
  $fragment = ''
  if ($u -match '#') {
    $fragment = $u.Substring($u.IndexOf('#'))
    $u = $u.Substring(0, $u.IndexOf('#'))
  }
  # Refresh existing v=
  if ($u -match '([?&])v=([0-9A-Za-z_\-\.]+)') {
    $u = [regex]::Replace($u, '([?&])v=([0-9A-Za-z_\-\.]+)', { param($m) $m.Groups[1].Value + 'v=' + $v })
    return $u + $fragment
  }
  # Add v= (choose ? or &)
  if ($u -match '\?') { $u = $u + '&v=' + $v } else { $u = $u + '?v=' + $v }
  return $u + $fragment
}

# For srcset values: "url1 640w, url2 1280w, url3 2x"
function Process-Srcset([string]$val, [string]$v) {
  $parts = $val -split ','
  $out = New-Object System.Collections.Generic.List[string]
  foreach ($raw in $parts) {
    $candidate = $raw.Trim()
    if ($candidate -eq '') { continue }
    $m = [regex]::Match($candidate, '^\s*(\S+)(?:\s+(.+))?$')
    $url = $candidate; $desc = ''
    if ($m.Success) { $url = $m.Groups[1].Value; $desc = $m.Groups[2].Value }

    if (Is-LocalUrl $url -and Has-AllowedExtension $url -and Passes-AllowedDir $url) {
      $url = Upsert-Version $url $v
    }

    if ([string]::IsNullOrEmpty($desc)) { $out.Add($url) } else { $out.Add("$url $desc") }
  }
  return ($out -join ', ')
}

# -----------------------------
# Gather HTML files robustly
# -----------------------------
$files = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
  $_.Extension -in @('.html', '.htm') -and $_.Name -ne '_headers'
}

# Attribute regexes (compatible with Windows PowerShell 5.x)
$attrLinkRegex   = New-Object System.Text.RegularExpressions.Regex '(?<attr>\b(?:href|src))\s*=\s*(?<q>["''])(?<url>[^"''\s>]+)\k<q>', ([System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$attrSrcsetRegex = New-Object System.Text.RegularExpressions.Regex '(?<attr>\bsrcset)\s*=\s*(?<q>["''])(?<val>[^"'']+)\k<q>', ([System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

# -----------------------------
# Process files
# -----------------------------
$changedCount = 0

foreach ($f in $files) {
  $orig = Get-Content -LiteralPath $f.FullName -Raw
  $updated = $orig

  # 1) Replace {{VER}} anywhere (simple & reliable)
  $updated = $updated -replace '\{\{VER\}\}', $ver

  # 2) href/src (single URL)
  $updated = $attrLinkRegex.Replace($updated, {
    param($m)
    $attr = $m.Groups['attr'].Value
    $q    = $m.Groups['q'].Value
    $url  = $m.Groups['url'].Value

    if (-not (Is-LocalUrl $url)) { return $m.Value }
    if (-not (Has-AllowedExtension $ url)) { return $m.Value }
    if (-not (Passes-AllowedDir $url)) { return $m.Value }

    $newUrl = Upsert-Version $url $ver
    if ($newUrl -eq $url) { return $m.Value }
    return "$attr=$q$newUrl$q"
  })

  # 3) srcset (multi-URL)
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
