param(
  [string]$PicsDir = (Join-Path $PSScriptRoot "..\assets\photos\frontpage-pics"),
  [string]$OutFile = (Join-Path $PicsDir "manifest.json")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $PicsDir)) {
  throw "Pictures directory not found: $PicsDir"
}

function Get-AltFromFilename([string]$fileName) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
  $name = $name -replace '[_-]',' '
  $name = $name -replace '\s+',' '
  $name = $name.Trim()

  if ([string]::IsNullOrWhiteSpace($name)) { return "Photo" }

  # Title-case-ish without being too aggressive
  return ($name.Substring(0,1).ToUpper() + $name.Substring(1))
}

$exts = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif")

$files = Get-ChildItem -LiteralPath $PicsDir -File |
  Where-Object { $exts -contains $_.Extension.ToLowerInvariant() } |
  Sort-Object Name

$manifest = [ordered]@{
  basePath = "assets/photos/frontpage-pics/"
  images   = @()
}

foreach ($f in $files) {
  $manifest.images += [ordered]@{
    file = $f.Name
    alt  = (Get-AltFromFilename $f.Name)
  }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$json = ($manifest | ConvertTo-Json -Depth 4)
[System.IO.File]::WriteAllText($OutFile, $json + "`n", $utf8NoBom)

Write-Host "Wrote manifest with $($files.Count) images to $OutFile"