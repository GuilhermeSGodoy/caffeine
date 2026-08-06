---
name: fix-frontend-lockfile
description: Use quando o CI do frontend (`.github/workflows/ci.yml`, job `frontend` ou `e2e`, Linux) falhar no `npm ci` com "package.json e package-lock.json fora de sincronia" ou "Missing: @emnapi/..." mesmo com `npm ci` limpo passando localmente no Windows — inconsistência conhecida de lockfile cross-platform.
---

# fix-frontend-lockfile

## Causa raiz

`npm install`/`npm ci` gerados em Windows podem produzir um `package-lock.json` inconsistente com
dependências opcionais nativas (ex.: pacotes `@napi-rs/*`/`@emnapi/*`) que só se manifesta no CI
(Linux). `@napi-rs/wasm-runtime` depende de `@emnapi/core`/`@emnapi/runtime` (peer optional) apenas
na resolução Linux, e o Windows pode gerar uma lockfile sem essas entradas mesmo assim funcionando
localmente. Isso já se repetiu mais de uma vez neste projeto, inclusive depois de um merge de
branch (regeneração da lockfile no merge omitiu as entradas de novo).

**Atenção**: `npm ci` limpo no Windows passar **não garante** que o CI (Linux) vai passar — não
confie só nisso para validar antes de commitar o lockfile.

## Passos

1. Apague `node_modules` e `package-lock.json` em `src/frontend` e rode `npm install` limpo:
   ```
   cd src/frontend
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Confirme com `npm ci` limpo localmente antes de commitar o lockfile:
   ```
   rm -rf node_modules
   npm ci
   ```
3. **Mesmo com o passo 2 passando**, confira diretamente no `package-lock.json` se as entradas
   `node_modules/@emnapi/core` e `node_modules/@emnapi/runtime` (e demais peers opcionais do
   `@napi-rs/wasm-runtime`) estão presentes — o Windows pode omiti-las silenciosamente.
4. Se o CI falhar de novo com "Missing: @emnapi/..." mesmo depois dos passos acima: copiar essas
   entradas de uma lockfile da `main` que já passou no CI é mais confiável do que tentar regenerar
   de novo no Windows.
