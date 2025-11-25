<#
Reverse-TbodyRows-Robust.ps1  (PowerShell 5.1)

- Reverses only the order of <tr>…</tr> rows inside a specific <tbody id="...">.
- Works whether a real </tbody> exists or not:
    Region end = first NON-COMMENT </tbody> after the tbody open,
                 else first NON-COMMENT </table> after the tbody open.
- Drops ALL inter-row gaps (comments/whitespace) exactly as requested.
- Leaves everything else unchanged.
- No number/date parsing. No content edits inside rows.

Caveat:
- If you embed nested <table>…</table> inside cells, their inner <tr>s would also match.
  If you need “direct child rows only,” tell me and I’ll give you a depth-aware variant.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$InputPath,

  [Parameter(Mandatory=$true)]
  [string]$TbodyId,

  [string]$OutputPath,

  [switch]$InPlace,

  [switch]$WhatIf,

  # Separator inserted between reversed rows; default = '' (back-to-back)
  [string]$JoinWith = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Input file not found: $InputPath"
}

# Read verbatim
[string]$html = Get-Content -LiteralPath $InputPath -Raw

# Helper: collect all HTML comment spans so we can ignore tags that live inside comments
$commentRe = '(?is)<!--.*?-->'
$commentMatches = [regex]::Matches($html, $commentRe)
$commentSpans = @()
foreach ($cm in $commentMatches) {
  $commentSpans += @{
    Start = $cm.Index
    End   = $cm.Index + $cm.Length
  }
}

function Test-InComment([int]$pos) {
  foreach ($span in $commentSpans) {
    if ($pos -ge $span.Start -and $pos -lt $span.End) { return $true }
  }
  return $false
}

# 1) Find the target <tbody id="...">
$tbodyOpenRe = '<tbody\b(?=[^>]*\bid\s*=\s*["'']' + [regex]::Escape($TbodyId) + '["''])[^>]*>'
$tbodyOpen = [regex]::Match($html, $tbodyOpenRe, 'IgnoreCase')
if (-not $tbodyOpen.Success) {
  throw "No <tbody id=""$TbodyId""> found."
}
$tbodyOpenEnd = $tbodyOpen.Index + $tbodyOpen.Length

# 2) Find region end: first NON-COMMENT </tbody> or, if none, NON-COMMENT </table>
$tbodyClose = [regex]::Match($html, '(?is)</tbody\s*>', 'IgnoreCase')
[int]$tbodyCloseIdx = -1
while ($tbodyClose.Success) {
  if ($tbodyClose.Index -gt $tbodyOpenEnd -and -not (Test-InComment $tbodyClose.Index)) {
    $tbodyCloseIdx = $tbodyClose.Index
    break
  }
  $tbodyClose = $tbodyClose.NextMatch()
}

$tableClose = [regex]::Match($html, '(?is)</table\s*>', 'IgnoreCase')
[int]$tableCloseIdx = -1
while ($tableClose.Success) {
  if ($tableClose.Index -gt $tbodyOpenEnd -and -not (Test-InComment $tableClose.Index)) {
    $tableCloseIdx = $tableClose.Index
    break
  }
  $tableClose = $tableClose.NextMatch()
}

[int]$regionEndIdx = -1
if ($tbodyCloseIdx -ge 0 -and $tableCloseIdx -ge 0) {
  $regionEndIdx = [Math]::Min($tbodyCloseIdx, $tableCloseIdx)
} elseif ($tbodyCloseIdx -ge 0) {
  $regionEndIdx = $tbodyCloseIdx
} elseif ($tableCloseIdx -ge 0) {
  $regionEndIdx = $tableCloseIdx
} else {
  throw "Could not find a non-comment </tbody> or </table> after <tbody id=""$TbodyId"">."
}

# 3) Slice: prefix / region / suffix
$prefix = $html.Substring(0, $tbodyOpenEnd)                   # includes the <tbody ...>
$region = $html.Substring($tbodyOpenEnd, $regionEndIdx - $tbodyOpenEnd)
$suffix = $html.Substring($regionEndIdx)                      # includes the closing tag we stopped at

# 4) Extract ALL rows (drops inter-row gaps)
$trRe = '(?is)<tr\b.*?</tr\s*>'
$trMatches = [regex]::Matches($region, $trRe)

if ($trMatches.Count -lt 2) {
  Write-Host "[Info] Found $($trMatches.Count) <tr> in tbody '$TbodyId'. Nothing to reverse."
  $noChange = $prefix + $region + $suffix
  if ($WhatIf)   { Write-Output $noChange; exit 0 }
  if ($OutputPath){ Set-Content -LiteralPath $OutputPath -Value $noChange -Encoding UTF8; Write-Host "[Done] Wrote unmodified output."; exit 0 }
  if ($InPlace)  { Write-Host "[Info] In-place selected, but no change needed."; exit 0 }
  exit 0
}

# Preserve leading and trailing text within the region (outside the rows)
[string]$leading  = $region.Substring(0, $trMatches[0].Index)
$lastMatch        = $trMatches[$trMatches.Count - 1]
$afterLastStart   = $lastMatch.Index + $lastMatch.Length
[string]$trailing = if ($afterLastStart -lt $region.Length) { $region.Substring($afterLastStart) } else { '' }

# Collect rows verbatim
$rows = for ($i = 0; $i -lt $trMatches.Count; $i++) { $trMatches[$i].Value }

# Reverse and reassemble (drop gaps; optionally join with -JoinWith)
[array]::Reverse($rows)
$regionNew = $leading + ($rows -join $JoinWith) + $trailing

# 5) Stitch back together
$result = $prefix + $regionNew + $suffix

# 6) Output
if ($WhatIf) {
  Write-Output $result
  exit 0
}

if ($OutputPath) {
  Set-Content -LiteralPath $OutputPath -Value $result -Encoding UTF8
  Write-Host "[Done] Reversed $($trMatches.Count) rows in tbody '$TbodyId' → $OutputPath"
  exit 0
}

if ($InPlace) {
  $ts = Get-Date -Format 'yyyyMMdd-HHmmss'
  $bak = "$InputPath.$ts.bak"
  Copy-Item -LiteralPath $InputPath -Destination $bak -Force
  Set-Content -LiteralPath $InputPath -Value $result -Encoding UTF8
  Write-Host "[Done] In-place updated: $InputPath"
  Write-Host "[Backup] Original saved as: $bak"
  exit 0
}

Write-Host "[NoWrite] Use -OutputPath, -InPlace, or -WhatIf."
