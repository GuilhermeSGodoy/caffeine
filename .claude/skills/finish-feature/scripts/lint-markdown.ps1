<#
Roda markdownlint (via npx, sem instalar nada no projeto) sobre os arquivos .md
alterados nesta branch em relacao a main. Nao roda sobre o repo inteiro - so
sobre o que mudou, para nao acusar divida markdown pre-existente fora de escopo.
Sai com codigo 0 e sem rodar nada se nenhum .md mudou.
#>

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")

Push-Location $repoRoot
try {
    $changedFiles = git diff --name-only --diff-filter=d main...HEAD -- "*.md" |
        Where-Object { Test-Path $_ }

    if (-not $changedFiles) {
        Write-Output "Nenhum arquivo .md alterado nesta branch - lint de markdown pulado."
        exit 0
    }

    npx --yes markdownlint-cli2 @changedFiles
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
