$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$targetDir = Join-Path $projectRoot "target"
$dependencyDir = Join-Path $targetDir "dependency"
$manifestPath = Join-Path $targetDir "test-classpath.mf"
$classpathJar = Join-Path $targetDir "test-classpath.jar"

if (-not (Test-Path $dependencyDir -PathType Container)) {
    throw "Dependency directory not found: $dependencyDir. Run mvn-copy-deps first."
}

$dependencies = Get-ChildItem $dependencyDir -Filter "*.jar" |
    Sort-Object Name |
    ForEach-Object { "dependency/$($_.Name)" }

if (-not $dependencies) {
    throw "No dependency jars found in: $dependencyDir"
}

$manifestLines = New-Object System.Collections.Generic.List[string]
$manifestLines.Add("Manifest-Version: 1.0")
$manifestLines.Add("Created-By: VS Code test classpath task")

function Add-FoldedManifestLine {
    param(
        [System.Collections.Generic.List[string]] $Lines,
        [string] $Name,
        [string] $Value
    )

    $line = "${Name}: $Value"
    while ($line.Length -gt 70) {
        $Lines.Add($line.Substring(0, 70))
        $line = " " + $line.Substring(70)
    }
    $Lines.Add($line)
}

Add-FoldedManifestLine -Lines $manifestLines -Name "Class-Path" -Value ($dependencies -join " ")
$manifestLines.Add("")

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
Set-Content -Path $manifestPath -Value $manifestLines -Encoding Ascii

if (Test-Path $classpathJar) {
    Remove-Item $classpathJar -Force
}

Add-Type -AssemblyName System.IO.Compression
$fileStream = [System.IO.File]::Open($classpathJar, [System.IO.FileMode]::CreateNew)
try {
    $zipArchive = New-Object System.IO.Compression.ZipArchive($fileStream, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $manifestEntry = $zipArchive.CreateEntry("META-INF/MANIFEST.MF")
        $entryStream = $manifestEntry.Open()
        try {
            $writer = New-Object System.IO.StreamWriter($entryStream, [System.Text.Encoding]::ASCII)
            try {
                foreach ($line in $manifestLines) {
                    $writer.Write($line)
                    $writer.Write("`r`n")
                }
            } finally {
                $writer.Dispose()
            }
        } finally {
            $entryStream.Dispose()
        }
    } finally {
        $zipArchive.Dispose()
    }
} finally {
    $fileStream.Dispose()
}

Write-Host "Created $classpathJar with $($dependencies.Count) dependency entries."
