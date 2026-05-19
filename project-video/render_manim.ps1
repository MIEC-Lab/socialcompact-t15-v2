$ErrorActionPreference = "Stop"

$hyperframesDir = Join-Path $PSScriptRoot "hyperframes"
$outputDir = Join-Path $PSScriptRoot "assets\manim"
$venvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$venvManim = Join-Path $PSScriptRoot ".venv\Scripts\manim.exe"

Push-Location $hyperframesDir
npm install
npm run setup-tools
$env:PATH = (Join-Path $hyperframesDir "bin") + ";" + $env:PATH
Pop-Location

if (-not (Test-Path $venvPython)) {
  python -m venv "$PSScriptRoot\.venv"
}

& $venvPython -m pip install manim
& $venvManim -qh "$PSScriptRoot\manim\socialcompact_pipeline.py" SocialCompactPipeline --media_dir "$PSScriptRoot\assets\manim\media"

$rendered = Get-ChildItem "$PSScriptRoot\assets\manim\media\videos" -Recurse -Filter "SocialCompactPipeline.mp4" | Select-Object -First 1
if (-not $rendered) {
  throw "Could not find rendered Manim MP4"
}

Copy-Item -LiteralPath $rendered.FullName -Destination (Join-Path $outputDir "socialcompact_pipeline.mp4") -Force
Copy-Item -LiteralPath $rendered.FullName -Destination (Join-Path $PSScriptRoot "manim\comparison_demo.mp4") -Force
Write-Output "Copied Manim clip to project-video\assets\manim\socialcompact_pipeline.mp4"
