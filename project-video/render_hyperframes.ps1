# Authorship: Runze Chen (F) owns the final HyperFrames export pipeline for the CS183 project video.
# Scope: Installs local tooling, ensures a browser binary is available, and renders the final comparison MP4.

$ErrorActionPreference = "Stop"

$hyperframesDir = Join-Path $PSScriptRoot "hyperframes"
Push-Location $hyperframesDir
npm install
npm run setup-tools
$env:PATH = (Join-Path $hyperframesDir "bin") + ";" + $env:PATH
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
  $env:PUPPETEER_EXECUTABLE_PATH = $chromePath
}
else {
  npx --yes hyperframes@0.6.25 browser ensure
}
npm run render
Pop-Location

Write-Output "Rendered final video to project-video\hyperframes\final_video.mp4"
