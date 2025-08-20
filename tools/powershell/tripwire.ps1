# tripwire.ps1 — PowerShell 5.1
# Fail if any {{VER}} placeholders remain in deployable files only.

$deployables = Get-ChildItem -Recurse -File |
  Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\bak\\' -and
    ( $_.Extension -in @('.html', '.htm') -or $_.Name -eq '_headers' )
  }

$hits = @()
foreach ($f in $deployables) {
  $m = Select-String -Path $f.FullName -Pattern '\{\{VER\}\}'
  if ($m) { $hits += $m }
}

if ($hits.Count -gt 0) {
  Write-Host "❌ Build blocked: '{{VER}}' found in deployables:" -ForegroundColor Red
  $hits | ForEach-Object { Write-Host (" - {0}:{1}: {2}" -f $_.Path, $_.LineNumber, $_.Line.Trim()) }
  exit 1
} else {
  Write-Host "✅ Tripwire clear: no '{{VER}}' in deployables."
}
