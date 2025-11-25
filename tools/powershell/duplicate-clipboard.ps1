param(
  [int] $Count = 52,            # how many copies to make
  [int] $Start = 1,             # first number to insert
  [int] $PadWidth = 0,          # 0 = no zero-padding; 2 => 01,02,...
  [switch] $BlankLineBetween,   # add a blank line between copies
  [switch] $RequirePlaceholder, # error if the template has no [] token
  [string] $Token = '[]'        # placeholder token to replace
)

# PowerShell 5.1-safe: helper to format numbers
function Format-Index([int]$i, [int]$pad) {
  if ($pad -gt 0) { return $i.ToString().PadLeft($pad,'0') }
  return $i.ToString()
}

# --- 1) Get template from clipboard ---
$tpl = Get-Clipboard -Raw
if ([string]::IsNullOrWhiteSpace($tpl)) {
  Write-Error "Clipboard is empty. Copy your <tr>…</tr> prototype first (containing $Token)."
  exit 1
}

# Normalize line endings to CRLF for VS Code on Windows
$tpl = $tpl -replace "`r?`n","`r`n"

# --- 2) Optional safety: ensure at least one placeholder exists ---
if ($RequirePlaceholder -and ($tpl -notmatch [regex]::Escape($Token))) {
  Write-Error "No $Token token found in the clipboard template. Add $Token wherever the auto-number should appear."
  exit 1
}

# --- 3) Duplicate with token replacement only ---
$rows = New-Object System.Collections.Generic.List[string]

# Precompile regex for the token to ensure literal match of [] (or custom)
$tokenPattern = [regex]::Escape($Token)

for ($n = 0; $n -lt $Count; $n++) {
  $idx = $Start + $n
  $num = Format-Index $idx $PadWidth
  $s = $tpl

  # Replace only the token; do not touch anything else
  $s = [regex]::Replace($s, $tokenPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $num })

  # Optional rescue: if someone typed '][' by mistake, treat it as the token too
  # Comment out next line if you want to be even stricter
  $s = $s -replace '\]\[', $num

  $rows.Add($s)
}

$sep = if ($BlankLineBetween) { "`r`n`r`n" } else { "`r`n" }
$result = [string]::Join($sep, $rows)

# --- 4) Return result (clipboard + console) ---
$result | Set-Clipboard
$result
