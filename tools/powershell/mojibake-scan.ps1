param(
  [ValidateSet('Workspace','File')] [string]$Mode = 'Workspace',
  [string]$Path
)

# ASCII-only regex using \u escapes
$pattern = '\u00C3.|\u00C2.|\u00E2.{1,2}|\u00F0.{1,3}|\u00EF\u00BB\u00BF|\uFFFD|fianc\u00C3\u00A9e|\u00F0\u0178\u2019\u00AC|\u00E2\u009C\u0089\u00EF\u00B8\u008F|\u0153\u2030\u00EF\u00B8\u008F|\u00E2\u009C\u0089|\u0153\u2030'


function Emit($file, $m) {
  $abs = (Resolve-Path -LiteralPath $file)
  $line = $m.Line.Trim()
  "{0}({1},{2}): error VSMB0001: Mojibake: {3}" -f $abs, $m.LineNumber, $m.ColumnNumber, $line
}

if ($Mode -eq 'Workspace') {
  Get-ChildItem -Path . -Recurse -File -Include *.html |
    Where-Object { $_.FullName -notmatch '\\bak\\' } |
    ForEach-Object {
      $p = $_.FullName
      Select-String -Path $p -Pattern $pattern | ForEach-Object { Emit $p $_ }
    }
}
elseif ($Mode -eq 'File') {
  if (-not $Path -or -not (Test-Path -LiteralPath $Path)) { exit 0 }
  Select-String -Path $Path -Pattern $pattern | ForEach-Object { Emit $Path $_ }
}
