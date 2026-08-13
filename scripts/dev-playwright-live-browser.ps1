$profileDir = Join-Path $env:TEMP "caffeine-playwright-debug-profile"
if (Test-Path $profileDir) {
    Remove-Item -Recurse -Force $profileDir
}

$chromeCandidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)
$chromePath = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chromePath) {
    throw "Chrome não encontrado em nenhum dos caminhos padrão: $($chromeCandidates -join ', ')"
}

& $chromePath --remote-debugging-port=9222 --user-data-dir="$profileDir"
