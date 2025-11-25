<# 
.SYNOPSIS
  Convert airports.csv to a keyed JSON map: { "KPAO": { name, city, state, country }, ... }

.DESCRIPTION
  - Picks code from gps_code -> ident -> local_code (uppercased), must match ^[A-Z0-9]{4}$
  - Excludes type=closed
  - Includes only allowed types (configurable)
  - De-dupes by code using type priority, then prefers rows with municipality
  - Writes pretty JSON in UTF-8 (PowerShell 5.1 compatible)

.EXAMPLE
  .\Build-IcaoJson.ps1 -InputCsv .\data\airports.csv -OutputJson .\data\icao-to-name.json

.PARAMETER InputCsv
  Path to airports.csv (OurAirports-style headers).

.PARAMETER OutputJson
  Path to write JSON (e.g., .\data\icao-to-name.json).

.PARAMETER IncludeTypes
  Airport types to keep. Default includes large/medium/small/seaplane_base/heliport.

.PARAMETER ExcludeHeliport
  If set, heliports are excluded.
#>

[CmdletBinding(PositionalBinding = $false)]
param(
  [Parameter(Mandatory = $true)]
  [string]$InputCsv,

  [Parameter(Mandatory = $true)]
  [string]$OutputJson,

  [string[]]$IncludeTypes = @('large_airport','medium_airport','small_airport','seaplane_base','heliport'),

  [switch]$ExcludeHeliport
)

# ---------------- Helpers (PS 5.1 safe) ----------------

function Get-CountryName {
  param([string]$Iso2)
  if ([string]::IsNullOrWhiteSpace($Iso2)) { return '' }
  try {
    $ri = [System.Globalization.RegionInfo]::new($Iso2.ToUpper())
    return $ri.EnglishName
  } catch {
    return $Iso2.ToUpper()
  }
}

function Get-StateFromRegion {
  param([string]$IsoRegion)
  if ([string]::IsNullOrWhiteSpace($IsoRegion)) { return '' }
  $parts = $IsoRegion -split '-'
  if ($parts.Count -ge 2) { return $parts[1] }
  return ''
}

function Get-CodeFromRow {
  param($Row)
  $candidates = @(
    [string]$Row.gps_code,
    [string]$Row.ident,
    [string]$Row.local_code
  ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  foreach ($raw in $candidates) {
    $code = ($raw.Trim()).ToUpper()
    if ($code -match '^[A-Z0-9]{4}$') { return $code }
  }
  return ''
}

# Type priority for de-dupe (higher is better)
$TypePriority = @{
  'large_airport' = 5
  'medium_airport' = 4
  'small_airport' = 3
  'seaplane_base' = 2
  'heliport' = 1
}

function Get-TypePriority {
  param([string]$Type)
  $t = ([string]$Type).Trim().ToLower()
  if ($TypePriority.ContainsKey($t)) { return $TypePriority[$t] }
  return 0
}

# Return $true if $B is better than $A
function Test-BetterRow {
  param($A, $B)

  $pa = Get-TypePriority -Type $A.type
  $pb = Get-TypePriority -Type $B.type
  if ($pb -ne $pa) { return ($pb -gt $pa) }

  $aHasCity = -not [string]::IsNullOrWhiteSpace([string]$A.municipality)
  $bHasCity = -not [string]::IsNullOrWhiteSpace([string]$B.municipality)
  if ($bHasCity -ne $aHasCity) { return $bHasCity }  # prefer row with municipality

  return $false  # keep the existing one
}

# ---------------- Input / validation ----------------

if (-not (Test-Path -LiteralPath $InputCsv)) {
  Write-Error "Input CSV not found: $InputCsv"
  exit 1
}

if ($ExcludeHeliport) {
  $IncludeTypes = $IncludeTypes | Where-Object { $_ -ne 'heliport' }
}

# Normalize allowed types to lowercase for comparison
$AllowedTypes = New-Object System.Collections.Generic.HashSet[string] ([StringComparer]::OrdinalIgnoreCase)
foreach ($t in $IncludeTypes) { [void]$AllowedTypes.Add($t.ToLower()) }

# ---------------- Load CSV ----------------

try {
  $rows = Import-Csv -LiteralPath $InputCsv
} catch {
  Write-Error "Failed to read CSV: $($_.Exception.Message)"
  exit 1
}

# ---------------- Build map by code ----------------

# Ordered dictionaries keep stable key order in PS 5.1
$byCode = New-Object System.Collections.Specialized.OrderedDictionary

$processed = 0
foreach ($row in $rows) {
  $processed++

  $type = ([string]$row.type).ToLower()
  if ($type -eq 'closed') { continue }
  if (-not $AllowedTypes.Contains($type)) { continue }

  $code = Get-CodeFromRow -Row $row
  if ([string]::IsNullOrWhiteSpace($code)) { continue }

  if (-not $byCode.Contains($code)) {
    $byCode.Add($code, $row)
  } else {
    $current = $byCode[$code]
    if (Test-BetterRow -A $current -B $row) {
      $byCode[$code] = $row
    }
  }
}

# ---------------- Project to desired shape ----------------

$out = New-Object System.Collections.Specialized.OrderedDictionary

foreach ($code in $byCode.Keys) {
  $r = $byCode[$code]

  $name = ''
  if ($null -ne $r.name) { $name = [string]$r.name }
  $name = $name.Trim()

  $city = ''
  if ($null -ne $r.municipality) { $city = [string]$r.municipality }
  $city = $city.Trim()

  $state = Get-StateFromRegion -IsoRegion $r.iso_region
  $state = $state.Trim()

  $country = Get-CountryName -Iso2 $r.iso_country
  $country = $country.Trim()

  $out[$code] = [ordered]@{
    name    = $name
    city    = $city
    state   = $state
    country = $country
  }
}

# ---------------- Write JSON (UTF-8) ----------------

# Ensure output directory exists
$dir = Split-Path -LiteralPath $OutputJson -Parent
if (-not [string]::IsNullOrWhiteSpace($dir) -and -not (Test-Path -LiteralPath $dir)) {
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

$json = $out | ConvertTo-Json -Depth 5
$json | Set-Content -LiteralPath $OutputJson -Encoding UTF8

# ---------------- Report ----------------

$kept = $out.Keys.Count
Write-Host ("Processed {0} CSV rows; wrote {1} codes → {2}" -f $processed, $kept, $OutputJson)

# Print a couple of examples if present
foreach ($probe in @('CEZ3','KPAO')) {
  if ($out.Contains($probe)) {
    $example = $out[$probe] | ConvertTo-Json -Compress
    Write-Host ("Example {0}: {1}" -f $probe, $example)
  }
}
