<#
Exporta GH_TOKEN a partir do Git Credential Manager para a sessao atual do PowerShell,
para uso quando `gh auth status` indica que nao ha login ativo e `gh auth login --with-token`
falha por falta do escopo `read:org` no token do Credential Manager.
#>

$credentialInput = "protocol=https`nhost=github.com`n`n"
$credentialOutput = $credentialInput | git credential fill

$passwordLine = $credentialOutput | Where-Object { $_ -like "password=*" }
if (-not $passwordLine) {
    Write-Error "Nao foi possivel obter credencial via 'git credential fill'."
    exit 1
}

$env:GH_TOKEN = $passwordLine.Substring("password=".Length)
Write-Output "GH_TOKEN exportado na sessao atual."
