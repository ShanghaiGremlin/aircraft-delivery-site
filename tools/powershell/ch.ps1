# tools/check-header.ps1  — Verify static header invariants across all *.html
# PS 5.1 compatible

$single = [System.Text.RegularExpressions.RegexOptions]::Singleline

# Patterns
$deskHeaderPattern = '<header\b(?=[^>]*class="[^"]*\bdesk-header\b[^"]*")[^>]*>.*?</header>'
$skipFirstPattern  = '<header\b(?=[^>]*class="[^"]*\bdesk-header\b[^"]*")[^>]*>\s*(?:<!--.*?-->\s*)*<a\b(?=[^>]*class="[^"]*\bskip-link\b[^"]*")(?=[^>]*href="#main")[^>]*>'
$deskNavPattern    = '<nav\b(?=[^>]*class="[^"]*\bdesk-nav\b[^"]*")[^>]*>.*?</nav>'
$mainPattern       = '<main\b(?=[^>]*id="main")(?=[^>]*tabindex="-1")[^>]*>'

$issues = @()

Get-ChildItem -Recurse -File -Include *.html | ForEach-Object {
  $file = $_.FullName
  $raw  = Get-Content $file -Raw

  # 1) Exactly one .desk-header
  $hdrMatches = [regex]::Matches($raw, $deskHeaderPattern, $single)
  if ($hdrMatches.Count -ne 1) {
    $issues += [pscustomobject]@{ File=$file; Issue="desk-header count = $($hdrMatches.Count)" }
    return
  }

  $headerHtml = $hdrMatches[0].Value

  # 2) Skip link is first child inside header
  if (-not [regex]::IsMatch($raw, $skipFirstPattern, $single)) {
    $issues += [pscustomobject]@{ File=$file; Issue="skip-link not first in .desk-header" }
  }

  # 3) .desk-nav exists and has exactly one aria-current="page"
  $navMatch = [regex]::Match($raw, $deskNavPattern, $single)
  if (-not $navMatch.Success) {
    $issues += [pscustomobject]@{ File=$file; Issue="no .desk-nav found" }
  } else {
    $navHtml = $navMatch.Value
    $currentCount = ([regex]::Matches($navHtml, '\baria-current="page"\b')).Count
    if ($currentCount -ne 1) {
      $issues += [pscustomobject]@{ File=$file; Issue="aria-current count in .desk-nav = $currentCount" }
    }
  }

  # 4) <main id="main" tabindex="-1"> present
  if (-not [regex]::IsMatch($raw, $mainPattern)) {
    $issues += [pscustomobject]@{ File=$file; Issue="<main id='main' tabindex='-1'> missing" }
  }
}

if ($issues.Count -gt 0) {
  $issues | Sort-Object File, Issue | Format-Table -AutoSize
  exit 1
} else {
  Write-Host "OK: All pages pass header checks." -ForegroundColor Green
  exit 0
}
