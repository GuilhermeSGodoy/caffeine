<#
Roda os builds de backend e frontend, parando no primeiro erro.
Nao roda testes nem lint - so confirma que o codigo compila antes de seguir para a revisao/PR.
#>

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")

dotnet build (Join-Path $repoRoot "src\backend\Caffeine.slnx")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location (Join-Path $repoRoot "src\frontend")
try {
    npx ng build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}

Write-Output "Build de backend e frontend concluidos com sucesso."
