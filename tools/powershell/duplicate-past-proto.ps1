# duplicate-past-proto.ps1
# Produces past-deliveries-ALL.html in grouped order:
#  1) All table rows (52→1)
#  2) All mobile folders (52→1)
#  3) All modals (52→1)

$src = 'past-test.html'
$outPath = 'past-deliveries-ALL.html'
$template = Get-Content $src -Raw

# --- isolate proto sections ---
$table = [regex]::Match($template, '(?s)(?<=<!--TABLE START-->).+?(?=<!--TABLE END-->)').Value
$mobile = [regex]::Match($template, '(?s)(?<=<!--MOBILE START-->).+?(?=<!--MOBILE END-->)').Value
$modal = [regex]::Match($template, '(?s)(?<=<!--MODAL START-->).+?(?=<!--MODAL END-->)').Value

if (-not $table -or -not $mobile -or -not $modal) {
  throw "❌ Missing section markers in $src"
}

# --- helper to expand 52→1 ---
function Expand-Section($snippet) {
  $out = @()
  for ($n = 52; $n -ge 1; $n--) {
    $out += ($snippet -replace '\[KEY\]', $n)
  }
  return $out -join "`r`n"
}

# --- build output ---
$out = @()
$out += "<!-- TABLE SECTION -->"
$out += (Expand-Section $table)
$out += "`r`n<!-- MOBILE SECTION -->"
$out += (Expand-Section $mobile)
$out += "`r`n<!-- MODAL SECTION -->"
$out += (Expand-Section $modal)

# --- write file ---
Set-Content -LiteralPath $outPath -Value ($out -join "`r`n") -Encoding UTF8
"`n✅ Created $outPath (grouped table→mobile→modal, 52→1)."
