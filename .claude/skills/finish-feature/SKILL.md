---
name: finish-feature
description: Use ao concluir o desenvolvimento de uma feature/correção nesta branch do Caffeine. Valida build e testes, roda a revisão de código interna (`code-review --fix`) e aplica os ajustes, faz push da branch e abre o Pull Request para main referenciando a issue correspondente, usando o template de PR — para revisão manual do usuário, sem merge automático.
---

# finish-feature

Último passo do workflow deste repositório (ver `CLAUDE.md`) antes de entregar uma feature/correção para revisão.

## Passos

1. **Confirme que não está em `main`** (`git branch --show-current`). Se estiver, algo saiu da ordem — volte ao workflow de `start-feature`.
2. **Valide localmente antes de abrir o PR** — apenas builds (rápidos, pegam erro de compilação) e os testes relevantes à mudança feita nesta branch. A suíte completa (unitários + E2E) não é mais exigida localmente — o CI (`.github/workflows/ci.yml`) é a fonte de verdade para isso:
   ```
   dotnet build src/backend/Caffeine.slnx
   cd src/frontend
   npx ng build
   cd ..
   ```
   Builds continuam rodados diretamente (rápidos, não precisam de subagente). Para os testes, use os subagentes dedicados em vez de rodar/escrever manualmente:
   - Invoque o subagente **`test-writer`** apontando o diff da branch (`git diff main...HEAD`) para revisar lacunas de teste do comportamento novo/corrigido. Ele só preenche lacunas reais — não substitui o teste principal já escrito durante a implementação. Se ele adicionar casos, eles entram no mesmo diff que vai para o PR.
   - Invoque o subagente **`test-runner`** passando os specs/filtros relevantes a esta branch (ex.: `dotnet test --filter ...`, `npx ng test --watch=false --include='**/arquivo.spec.ts'`, ou o novo teste E2E isolado) para executá-los e resumir o resultado — não peça a ele para rodar a suíte inteira.
3. **Rode a revisão de código interna do Claude Code e aplique os ajustes.** Invoque a skill `code-review` sobre o diff desta branch (`git diff main...HEAD`) no nível de esforço `medium` (equilíbrio entre pegar bugs reais e não gerar ruído — `low` pode deixar passar algo, `high`/`max` inclui achados incertos demais para aplicar sem revisão humana) com a flag `--fix`, para que os achados (bugs de correção, simplificação, reuso, eficiência) já sejam aplicados ao working tree.
   - **Revalide depois de aplicar**: os ajustes da revisão podem alterar código-fonte, então rode o build de novo e, se os arquivos alterados tiverem specs correspondentes, invoque o **`test-runner`** de novo nesses specs antes de seguir.
   - Se a revisão não encontrar nada (ou nada seguro para corrigir automaticamente), siga sem alterações — não force um ajuste.
   - O diff final que vai para o PR pode incluir essas correções além da implementação original — deixe isso explícito no passo de confirmação com o usuário e na descrição do PR.
4. **Atualize o README** se a feature corresponder a um item da seção "Requisitos do Projeto": ajuste o status (🟢/🟡/⚪) e garanta que o link da issue está presente.
5. **Confirme com o usuário antes de commitar/dar push** — commitar e enviar código para o GitHub são ações que afetam o repositório remoto; siga o padrão de mensagem de commit definido em `CLAUDE.md`: `<tipo>: <descrição> [#<numero-da-issue>]` (ex.: `feat: adiciona busca e substituição de texto [#12]`). Se a revisão de código do passo 3 tiver aplicado algo, resuma o que foi ajustado.
6. **Dê push da branch**:
   ```
   git push -u origin <branch>
   ```
7. **Abra o Pull Request** para `main`, usando a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, preenchendo "O que foi feito" e "Como validar", e referenciando a issue com `Closes #<numero>`.
   - `gh` (GitHub CLI) está instalado nesta máquina. Use `gh pr create --repo <owner>/<repo> --title "..." --body "..."`. Se a autenticação/PATH falhar, siga o mesmo procedimento (`GH_TOKEN` via `git credential fill`, caminho completo do executável, fallback via PowerShell) descrito em `start-feature` — não peça um token ao usuário antes de tentar essa via.
8. **Não faça merge do PR** — ele fica para revisão manual do usuário. Informe o link do PR e pare aqui.
9. **Quando o usuário aprovar e pedir o merge**: o merge deve ser um **merge normal** (merge commit, preservando os commits individuais da branch) — não usar squash merge nem rebase merge.
