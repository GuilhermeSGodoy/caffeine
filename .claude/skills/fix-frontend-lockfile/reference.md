# Causa raiz

`npm install`/`npm ci` gerados em Windows podem produzir um `package-lock.json` inconsistente com
dependências opcionais nativas (ex.: pacotes `@napi-rs/*`/`@emnapi/*`) que só se manifesta no CI
(Linux). `@napi-rs/wasm-runtime` depende de `@emnapi/core`/`@emnapi/runtime` (peer optional) apenas
na resolução Linux, e o Windows pode gerar uma lockfile sem essas entradas mesmo assim funcionando
localmente. Isso já se repetiu mais de uma vez neste projeto, inclusive depois de um merge de
branch (regeneração da lockfile no merge omitiu as entradas de novo).

**Atenção**: `npm ci` limpo no Windows passar **não garante** que o CI (Linux) vai passar — não
confie só nisso para validar antes de commitar o lockfile.
