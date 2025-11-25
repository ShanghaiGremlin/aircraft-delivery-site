<# csv-fill-past.ps1 — strict CSV→HTML filler (supports numbered data-colN/data-attrN)
   Scope: <tbody id="past-desk-tbody">…</tbody> (strict id, double quotes)
   Rows : numeric keys only (data-key="123")
   Fills:
     • Non-void tags with data-col="Col" → inner text (or data-attr="Attr" if present)
     • Void tags (img, source, …): APPLY ALL pairs:
         data-col="ColA"   data-attr="attrA"
         data-col2="ColB"  data-attr2="attrB"
         data-col3="ColC"  data-attr3="attrC"   …etc.
   Strict:
     • Double quotes only, no spaces around '=', case-sensitive headers
     • Audits single quotes / spacing; for voids, requires matching data-attrN for each data-colN
#>

param(
  [Parameter(Mandatory=$true)]
  [string] $HtmlPath,
  [Parameter(Mandatory=$true)]
  [string] $CsvPath,
  [string] $TbodyId = 'past-desk-tbody',
  [switch] $DryRun,
  [switch] $Report = $true,
  [switch] $AbortOnErrors = $true
)

# ---------- Load ----------
if (-not (Test-Path $HtmlPath)) { throw ("HTML not found: {0}" -f $HtmlPath) }
if (-not (Test-Path $CsvPath))  { throw ("CSV not found:  {0}" -f $CsvPath) }
$html = Get-Content -Raw -Path $HtmlPath
$csv  = Import-Csv -Path $CsvPath
if (-not $csv -or $csv.Count -eq 0) { throw "CSV has no rows." }
$csvHeaders = $csv[0].PsObject.Properties.Name

# ---------- Helpers ----------
function Get-LineCol([string]$text, [int]$index) {
  if ($index -lt 0) { return @{ Line=1; Col=1 } }
  $prefix = $text.Substring(0, [Math]::Min($index, $text.Length))
  $line = ([regex]::Matches($prefix, "`n")).Count + 1
  $last = $prefix.LastIndexOf("`n")
  $col  = if ($last -ge 0) { $prefix.Length - $last } else { $prefix.Length + 1 }
  return @{ Line = $line; Col = $col }
}
function Snip([string]$s) { ($s -replace '\s+',' ') -replace '^(.{0,200}).*$', '$1' }
$Errors = New-Object System.Collections.Generic.List[pscustomobject]
$Logs   = New-Object System.Collections.Generic.List[string]
function Add-Err([string]$msg, [int]$absIndex, [string]$frag) {
  $lc = Get-LineCol -text $html -index $absIndex
  $Errors.Add([pscustomobject]@{ Line=$lc.Line; Col=$lc.Col; Msg=$msg; Frag=(Snip $frag) })
}
function Log([string]$s) { if ($Report) { $Logs.Add($s) } }

function HtmlEscape-Attr([string]$v) {
  if ($null -eq $v) { return '' }
  $v = $v -replace '&','&amp;'
  $v = $v -replace '"','&quot;'
  $v
}
function Set-Or-Add-Attr([string]$startTag, [string]$attrName, [string]$attrValue) {
  $escaped = HtmlEscape-Attr $attrValue
  $pat = "(?s)\b$([regex]::Escape($attrName))=""[^""]*"""
  if ([regex]::IsMatch($startTag, $pat)) {
    return [regex]::Replace($startTag, $pat, ("{0}=""{1}""" -f $attrName, $escaped))
  } else {
    return [regex]::Replace($startTag, '(?s)>\s*$', (" {0}=""{1}"">" -f $attrName, $escaped))
  }
}

# ---------- Strict patterns ----------
$patTbody = ('(?is)(?<open><tbody\b[^>]*\bid="{0}"[^>]*>)(?<body>.*?)(?<close></tbody>)' -f [regex]::Escape($TbodyId))
$tb = [regex]::Match($html, $patTbody)
if (-not $tb.Success) { throw ('Strict tbody not found: <tbody id="{0}">' -f $TbodyId) }
$tbodyOpen  = $tb.Groups['open'].Value
$tbodyInner = $tb.Groups['body'].Value
$tbodyClose = $tb.Groups['close'].Value
$tbodyInnerStart = $tb.Groups['body'].Index

# Numeric rows only
$patRow = '(?is)(?<open><tr\b[^>]*\bdata-key="(?<k>\d+)"[^>]*>)(?<inner>.*?)(?<close></tr>)'
$rows = [regex]::Matches($tbodyInner, $patRow)
if ($rows.Count -eq 0) { throw 'No numeric rows found in tbody (strict requires <tr data-key="123">).' }

# allow: data-col, data-col2, data-col-2 (same for data-attr)
$patSingleQuoted = "\bdata-(?:col|attr)(?:-\d+|\d+)?='[^']*'"
$patAttrFull     = '\b(?<name>data-(?:col|attr)(?:-\d+|\d+)?)(?<beforeEq>[ \t]*)=(?<afterEq>[ \t]*)["''][^"'']*["'']'

# Fill patterns
# Leaf-most non-void elements: inner has no further data-col="
$nonVoidLeaf = '(?is)<(?<tag>[a-z][a-z0-9:-]*)\b(?<attrs>[^>]*\bdata-col="(?<col>[^"]+)"[^>]*)>(?<inner>(?:(?!data-col=").)*?)</\k<tag>>'
# Any void element
$voidTags = 'img|input|source|meta|link|br|hr|area|base|col|embed|param|track|wbr'
$voidAny  = ("(?is)<(?<tag>$voidTags)\b(?<attrs>[^>]*)/?>")

# ---------- Process ----------
$tbodyOut = New-Object System.Text.StringBuilder
$cursor = 0

foreach ($rm in $rows) {
  if ($rm.Index -gt $cursor) { [void]$tbodyOut.Append($tbodyInner.Substring($cursor, $rm.Index - $cursor)) }

  $rowOpen  = $rm.Groups['open'].Value
  $rowInner = $rm.Groups['inner'].Value
  $rowClose = $rm.Groups['close'].Value
  $rowStartAbs = $tbodyInnerStart + $rm.Index
  $key = $rm.Groups['k'].Value

  # CSV lookup (strict "key")
  $csvRow = $csv | Where-Object { [string]$_.key -ceq [string]$key } | Select-Object -First 1
  if (-not $csvRow) {
    Add-Err (("key {0}: no CSV row for key='{0}'" -f $key)) $rowStartAbs $rowOpen
    [void]$tbodyOut.Append($rowOpen + $rowInner + $rowClose); $cursor = $rm.Index + $rm.Length; continue
  }

  # ---- STRICT AUDIT (row scope) ----
  foreach ($m in [regex]::Matches($rowInner, $patSingleQuoted)) {
    Add-Err 'Single quotes not allowed (use double quotes)' ($rowStartAbs + $rm.Groups['inner'].Index + $m.Index) $m.Value
  }
  foreach ($m in [regex]::Matches($rowInner, $patAttrFull)) {
    if ($m.Groups['beforeEq'].Value.Length -gt 0 -or $m.Groups['afterEq'].Value.Length -gt 0) {
      Add-Err 'Spaces around "=" not allowed (use name="value")' ($rowStartAbs + $rm.Groups['inner'].Index + $m.Index) $m.Value
    }
  }
# For voids, require matching data-attrN for every data-colN in the same start tag (PS 5.1-safe)
foreach ($vm in [regex]::Matches($rowInner, $voidAny)) {
  $start = "<" + $vm.Groups['tag'].Value + $vm.Groups['attrs'].Value + ">"
  $tokens = [regex]::Matches($start, '\b(?<k>data-(?:col|attr))(?<n>\d*)="(?<v>[^"]+)"')
  if ($tokens.Count -eq 0) { continue }

  $colsByIdx  = @{}
  $attrsByIdx = @{}
  foreach ($t in $tokens) {
 $suf = $t.Groups['suffix'].Value
$idx = if ($suf.StartsWith('-')) { $suf.Substring(1) } else { $suf }

    if ($t.Groups['k'].Value -ceq 'data-col') {
      if (-not $colsByIdx.ContainsKey($idx)) { $colsByIdx[$idx] = 0 }
      $colsByIdx[$idx] = [int]$colsByIdx[$idx] + 1
    } else {
      if (-not $attrsByIdx.ContainsKey($idx)) { $attrsByIdx[$idx] = 0 }
      $attrsByIdx[$idx] = [int]$attrsByIdx[$idx] + 1
    }
  }

  foreach ($idx in $colsByIdx.Keys) {
    $need = [int]$colsByIdx[$idx]
    $have = if ($attrsByIdx.ContainsKey($idx)) { [int]$attrsByIdx[$idx] } else { 0 }
    if ($have -lt $need) {
      $suffix = $idx
      if ($null -eq $suffix) { $suffix = '' }
      $msg = "Void tag <{0}> has data-col{1} but missing matching data-attr{1}"
      $formatted = [string]::Format($msg, $vm.Groups['tag'].Value, $suffix)
      Add-Err $formatted ($rowStartAbs + $rm.Groups['inner'].Index + $vm.Index) $start
    }
  }
}

foreach ($cm in [regex]::Matches($rowInner, '\bdata-col(?:-\d+|\d+)?="(?<h>[^"]+)"')) {
    $hname = $cm.Groups['h'].Value
    if ($csvHeaders -notcontains $hname) {
      Add-Err (("CSV header missing (strict, case-sensitive): {0}" -f $hname)) ($rowStartAbs + $rm.Groups['inner'].Index + $cm.Index) $cm.Value
    }
  }
  if ($AbortOnErrors -and $Errors.Count -gt 0) {
    [void]$tbodyOut.Append($rowOpen + $rowInner + $rowClose); $cursor = $rm.Index + $rm.Length; continue
  }

  # ---- FILL non-void (leaf-most, inner→outer) ----
  $rowFilled = $rowInner
  for ($pass = 1; $pass -le 8; $pass++) {
    $before = $rowFilled
    $rowFilled = [regex]::Replace($rowFilled, $nonVoidLeaf, {
      param($m2)
      $tag   = $m2.Groups['tag'].Value
      $attrs = $m2.Groups['attrs'].Value
      $col   = $m2.Groups['col'].Value
      $inner = $m2.Groups['inner'].Value
      $prop = $csvRow.PSObject.Properties | Where-Object { $_.Name -ceq $col } | Select-Object -First 1
      if ($null -eq $prop) { return $m2.Value }
      $val = [string]$prop.Value
      $start = "<$tag$attrs>"
      $am = [regex]::Match($start, '\bdata-attr="(?<a>[^"]+)"')
      if ($am.Success) {
        $newStart = Set-Or-Add-Attr $start $am.Groups['a'].Value $val
        Log (("SET  key={0} {1} <- {2}" -f $key, $am.Groups['a'].Value, $col))
        return $newStart + $inner + "</$tag>"
      } else {
        Log (("TEXT key={0} {1}" -f $key, $col))
        return "<$tag$attrs>$val</$tag>"
      }
    })
    if ($rowFilled -ceq $before) { break }
  }
# ---- ATTR-MAP: any element that declares data-attr* (strict same-index pairing) ----
$attrAny = '(?is)<(?<tag>[a-z][a-z0-9:-]*)\b(?<attrs>(?:(?!>).)*\bdata-attr(?:-\d+|\d+)?="[^"]+"(?:(?!>).)*)>'
$rowFilled = [regex]::Replace($rowFilled, $attrAny, {
  param($m3)
  $tag   = $m3.Groups['tag'].Value
  $attrs = $m3.Groups['attrs'].Value
  $start = "<$tag$attrs>"

  # (optional) token dump for debugging
  if ($Report) {
    $tokDump = [regex]::Matches($start, '\bdata-(?:col|attr)(?:-\d+|\d+)?="[^"]+"') | ForEach-Object { $_.Value }
    if ($tokDump.Count -gt 0) { Log ([string]::Format("TOK  key={0} <{1}> {2}", $key, $tag, ($tokDump -join ' '))) }
  }

  # Parse mapping tokens (supports N and -N)
  $tokPat = '\b(?<kind>data-(?:col|attr))(?<suffix>(?:-\d+|\d+)?)="(?<v>[^"]+)"'
  $tokens = [regex]::Matches($start, $tokPat)
  if ($tokens.Count -eq 0) { return $m3.Value }

  $colsByIdx  = @{}
  $attrsByIdx = @{}
  $idxOrder   = New-Object System.Collections.Generic.List[string]
  $seen = @{}
  foreach ($t in $tokens) {
    $suf = $t.Groups['suffix'].Value
    $idx = if ($suf.StartsWith('-')) { $suf.Substring(1) } else { $suf }
    if (-not $seen.ContainsKey($idx)) { $seen[$idx] = $true; $idxOrder.Add($idx) }
    $val = $t.Groups['v'].Value
    if ($t.Groups['kind'].Value -ceq 'data-col') {
      if (-not $colsByIdx.ContainsKey($idx)) { $colsByIdx[$idx] = New-Object System.Collections.ArrayList }
      [void]$colsByIdx[$idx].Add($val)
    } else {
      if (-not $attrsByIdx.ContainsKey($idx)) { $attrsByIdx[$idx] = New-Object System.Collections.ArrayList }
      [void]$attrsByIdx[$idx].Add($val)
    }
  }

  function Pop-First([System.Collections.ArrayList]$list) {
    if ($null -eq $list -or $list.Count -eq 0) { return $null }
    $v = $list[0]; $list.RemoveAt(0); return [string]$v
  }

  foreach ($idx in $idxOrder) {
    $colList  = $colsByIdx[$idx]
    $attrList = $attrsByIdx[$idx]
    $idxDisp  = if ([string]::IsNullOrEmpty($idx)) { '0' } else { $idx }

    if (-not $colList -or -not $attrList) {
      if ($Report) {
        $missing = if (-not $colList) { 'data-col' + $idx } else { 'data-attr' + $idx }
        Log ([string]::Format("STRICT SKIP key={0} <{1}> idx={2} (missing {3})", $key, $tag, $idxDisp, $missing))
      }
      continue
    }

    $pairCount = [Math]::Min($colList.Count, $attrList.Count)
    for ($i = 0; $i -lt $pairCount; $i++) {
      $csvCol  = Pop-First $colList
      $attrOut = Pop-First $attrList

      $p = $csvRow.PSObject.Properties | Where-Object { $_.Name -ceq $csvCol } | Select-Object -First 1
      if ($null -eq $p) {
        if ($Report) { Log ([string]::Format("STRICT SKIP key={0} <{1}> idx={2} {3} <- {4} (CSV header missing)", $key, $tag, $idxDisp, $attrOut, $csvCol)) }
        continue
      }

      $val = [string]$p.Value
      $start = Set-Or-Add-Attr $start $attrOut $val
      if ($Report) { Log ([string]::Format("SET  key={0} {1} <- {2}", $key, $attrOut, $csvCol)) }
    }

    # log leftovers (ignored in strict)
    if ($Report) {
      if ($colList -and $colList.Count -gt 0) { Log ([string]::Format("STRICT SKIP key={0} <{1}> idx={2} leftover data-col{2}={3}", $key, $tag, $idxDisp, ($colList -join '|'))) }
      if ($attrList -and $attrList.Count -gt 0) { Log ([string]::Format("STRICT SKIP key={0} <{1}> idx={2} leftover data-attr{2}={3}", $key, $tag, $idxDisp, ($attrList -join '|'))) }
    }
  }

  return $start
})


}






  [void]$tbodyOut.Append($rowOpen + $rowFilled + $rowClose)
  $cursor = $rm.Index + $rm.Length


if ($cursor -lt $tbodyInner.Length) {
  [void]$tbodyOut.Append($tbodyInner.Substring($cursor))
}

# ---------- Finalize ----------
if ($Errors.Count -gt 0 -and $AbortOnErrors) {
  Write-Host "ABORT: strict errors detected — no changes written." -ForegroundColor Red
  $Errors | Sort-Object Line, Col | ForEach-Object {
    "{0}:{1}:{2}  {3}  ::  {4}" -f (Split-Path -Leaf $HtmlPath), $_.Line, $_.Col, $_.Msg, $_.Frag
  } | Write-Host -ForegroundColor Red
  if ($Report -and $Logs.Count -gt 0) {
    Write-Host "`nPreview of would-be actions:" -ForegroundColor DarkGray
    $Logs | Select-Object -First 50 | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor DarkGray }
  }
  exit 1
}

$updated = $html.Substring(0, $tb.Index) + $tbodyOpen + $tbodyOut.ToString() + $tbodyClose + $html.Substring($tb.Index + $tb.Length)

# Report
if ($Report) {
  Write-Host ("Rows processed: {0}" -f $rows.Count)
  if ($Logs.Count -gt 0) {
    Write-Host "Actions:"; $Logs | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor Green }
  } else {
    Write-Host "No fillable slots found." -ForegroundColor Yellow
  }
}

# Write or preview
if ($DryRun) {
  $frag = (Split-Path $HtmlPath -Parent) + "\_" + $TbodyId + ".filled.fragment.html"
  Set-Content -Path $frag -Value ($tbodyOpen + $tbodyOut.ToString() + $tbodyClose) -Encoding UTF8
  Write-Host ("DryRun: wrote fragment: {0}" -f $frag)
} else {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $bak = "$HtmlPath.$ts.bak"
  Copy-Item $HtmlPath $bak
  Set-Content -Path $HtmlPath -Value $updated -Encoding UTF8
  Write-Host ("Wrote: {0}  (backup: {1})" -f $HtmlPath, $bak)
}
