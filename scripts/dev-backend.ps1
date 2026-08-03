$env:CAFFEINE_API_URL = "http://127.0.0.1:5000"
$env:CAFFEINE_DATA_DIR = Join-Path $PSScriptRoot "..\.devdata"
dotnet watch run --project (Join-Path $PSScriptRoot "..\src\backend\Caffeine.Api")
