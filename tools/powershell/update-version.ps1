<#
  update-version.ps1
  - Replaces {{VER}} tokens anywhere in HTML.
  - Adds or refreshes v=... for allowed local assets in href, src, and srcset.
  - For changed files, saves backups under: bak\<timestamp>\[relative\path\to\file]
  - Skips any HTML inside backup folders (bak/backup/backups) and files already marked as .bak.
  - Retention: keep only the 10 most-recent bak\<timestamp>\ folders.
  - Ensures .gitignore contains "/bak/" so backups are never committed.
#>

[CmdletBinding()]
param(
  [switch]$DryRun,
  [string]$Root
)

$ErrorActionPreference = 'Stop'

# -------- Config --------
$ver                = (Get-Date).ToString('yyyyMMdd-HHmmss')   # version token & run folder name
$onlyLocal          = $true                                     # skip http(s), //, data:, etc.
$allowedExtPattern  = 'css|js|png|jpg|jpeg|webp|gif|svg'        # extend if needed (e.g., ico|woff2|woff)
$allowedDirRegex    = ''                                        # e.g., '^/(assets|css|js)/' to restrict
$backupFolderName   = 'bak'
$backupFolderRegex  = '[\\/](bak|backup|backups)[\\/]'          # folders to skip
$retainBackupFolders = 10                                       # keep latest N bak\<timestamp>\ folders
$ensureGitignoreBak = $true                                     # ensure "/bak/" is in .gitignore

# -------- Resolve root (default to caller's CWD) --------
$invokedAt  = (Get-Location).Path
if ($PSBoundParameters.ContainsKey('Root') -and $Root) {
  $repoRoot = (Resolve-Path -LiteralPath $Root).Path
} else {
  $repoRoot = $invokedAt
}

Write-Host "Version: $ver"
Write-Host "Root:    $repoRoot"
if ($DryRun) { Write-Host "Mode:   DRY RUN (no writes)" -ForegroundColor Yellow }

# -------- Helpers --------
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
  $fragment = ''
  if ($u -match '#') {
    $fragment = $u.Substring($u.IndexOf('#'))
    $u = $u.Substring(0, $u.IndexOf('#'))
  }
  if ($u -match '([?&])v=([0-9A-Za-z_\-\.]+)') {
    $u = [regex]::Replace($u, '([?&])v=([0-9A-Za-z_\-\.]+)', { param($m) $m.Groups[1].Value + 'v=' + $v })
    return $u + $fragment
  }
  if ($u -match '\?') { $u = $u + '&v=' + $v } else { $u = $u + '?v=' + $v }
  return $u + $fragment
}
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

# -------- Gather HTML files (skip backups) --------
$files = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
  $_.Extension -in @('.html','.htm') -and
  $_.Name -ne '_headers' -and
  $_.Name -notmatch '\.bak\.' -and
  $_.FullName -notmatch $backupFolderRegex
}

# -------- Regexes --------
$attrLinkRegex   = New-Object System.Text.RegularExpressions.Regex '(?<attr>\b(?:href|src))\s*=\s*(?<q>["''])(?<url>[^"''\s>]+)\k<q>', ([System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$attrSrcsetRegex = New-Object System.Text.RegularExpressions.Regex '(?<attr>\bsrcset)\s*=\s*(?<q>["''])(?<val>[^"'']+)\k<q>', ([System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

# -------- Prepare this-run backup root --------
$runBakRoot = Join-Path $repoRoot (Join-Path $backupFolderName $ver)
$changed = New-Object System.Collections.Generic.List[string]

# -------- Process files --------
foreach ($f in $files) {
  $orig = Get-Content -LiteralPath $f.FullName -Raw
  $updated = $orig

  # 1) Replace {{VER}}
  $updated = $updated -replace '\{\{VER\}\}', $ver

  # 2) href/src
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

  # 3) srcset
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
    if ($DryRun) {
      Write-Host "[DRY] Would update: $($f.FullName)"
    } else {
      # Ensure this-run backup folder + relative subfolder exist
      $relPath = $f.FullName.Substring($repoRoot.Length).TrimStart('\','/')
      $destPath = Join-Path $runBakRoot $relPath
      $destDir  = Split-Path -Parent $destPath
      if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }

      # Backup original file into bak\<timestamp>\[relative\path]
      Copy-Item -LiteralPath $f.FullName -Destination $destPath -Force

      # Write updated file
      Set-Content -LiteralPath $f.FullName -Value $updated -NoNewline
      Write-Host "Updated: $($f.FullName)"
      Write-Host "Backup : $destPath"
    }
    $changed.Add($f.FullName) | Out-Null
  }
}

# -------- Retention: keep only the newest N bak\<timestamp>\ folders --------
if (-not $DryRun) {
  $bakRoot = Join-Path $repoRoot $backupFolderName
  if (Test-Path $bakRoot) {
    $runDirs = Get-ChildItem -Path $bakRoot -Directory -ErrorAction SilentlyContinue |
               Sort-Object Name -Descending  # Name is the timestamp; sorts newest first
    if ($runDirs.Count -gt $retainBackupFolders) {
      $toRemove = $runDirs | Select-Object -Skip $retainBackupFolders
      foreach ($d in $toRemove) {
        try {
          Remove-Item -LiteralPath $d.FullName -Recurse -Force
          Write-Host "Pruned : $($d.FullName)"
        } catch {
          Write-Warning "Could not remove backup folder: $($d.FullName) - $_"
        }
      }
    }
  }
}

# -------- Ensure .gitignore has /bak/ --------
if (-not $DryRun -and $ensureGitignoreBak) {
  $giPath = Join-Path $repoRoot ".gitignore"
  $needsWrite = $true
  if (Test-Path $giPath) {
    $giRaw = Get-Content -LiteralPath $giPath -Raw
    if ($giRaw -match '(?m)^[ ]*/bak/[ ]*$') { $needsWrite = $false }
  }
  if ($needsWrite) {
    $append = if (Test-Path $giPath) { "`r`n/bak/`r`n" } else { "/bak/`r`n" }
    Add-Content -LiteralPath $giPath -Value $append
    Write-Host "Updated .gitignore with /bak/"
  }
}

if ($DryRun) {
  Write-Host "`nDRY RUN complete. Files that would change: $($changed.Count)"
} else {
  Write-Host "`nDone. Files changed: $($changed.Count)"
}
