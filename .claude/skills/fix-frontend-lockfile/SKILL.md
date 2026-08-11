---
name: fix-frontend-lockfile
description: Use quando o CI do frontend (`.github/workflows/ci.yml`, job `frontend` ou `e2e`, Linux) falhar no `npm ci` com "package.json e package-lock.json fora de sincronia" ou "Missing: @emnapi/..." mesmo com `npm ci` limpo passando localmente no Windows — inconsistência conhecida de lockfile cross-platform.
---

# fix-frontend-lockfile

Ver [reference.md](reference.md) para a causa raiz e por que isso se repete.

## Passos

1. Apague `node_modules` e `package-lock.json` em `src/frontend` e rode `npm install` limpo:
   ```powershell
   cd src/frontend
   Remove-Item -Recurse -Force node_modules, package-lock.json
   npm install
   ```
2. Confirme com `npm ci` limpo localmente antes de commitar o lockfile:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm ci
   ```
3. **Mesmo com o passo 2 passando**, confira diretamente no `package-lock.json` se as entradas
   `node_modules/@emnapi/core` e `node_modules/@emnapi/runtime` (e demais peers opcionais do
   `@napi-rs/wasm-runtime`) estão presentes — o Windows pode omiti-las silenciosamente.
4. Se o CI falhar de novo com "Missing: @emnapi/..." mesmo depois dos passos acima: copiar essas
   entradas de uma lockfile da `main` que já passou no CI é mais confiável do que tentar regenerar
   de novo no Windows.
