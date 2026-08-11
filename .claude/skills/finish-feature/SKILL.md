---
name: finish-feature
description: Use ao concluir o desenvolvimento de uma feature/correção nesta branch do Caffeine. Valida build e testes, checa consistência de documentação/tooling quando aplicável, roda a revisão de código interna (`code-review --fix`) e aplica os ajustes, faz push da branch e abre o Pull Request para main referenciando a issue correspondente, usando o template de PR — para revisão manual do usuário, sem merge automático.
---

# finish-feature

Último passo do workflow deste repositório (ver `CLAUDE.md`) antes de entregar uma feature/correção para revisão.

## Passos

1. **Confirme que não está em `main`** (`git branch --show-current`). Se estiver, algo saiu da ordem — volte ao workflow de `start-feature`.
2. **Valide localmente antes de abrir o PR** — apenas builds (rápidos, pegam erro de compilação) e os testes relevantes à mudança feita nesta branch. A suíte completa (unitários + E2E) não é mais exigida localmente — o CI (`.github/workflows/ci.yml`) é a fonte de verdade para isso. Rode `.claude/skills/finish-feature/scripts/validate-build.ps1` (nesta skill, caminho relativo à raiz do repo) para os builds de backend e frontend — não precisa de subagente. Para os testes, use os subagentes dedicados em vez de rodar/escrever manualmente:
   - Invoque o subagente **`test-writer`** apontando o diff da branch (`git diff main...HEAD`) para revisar lacunas de teste do comportamento novo/corrigido. Ele só preenche lacunas reais — não substitui o teste principal já escrito durante a implementação. Se ele adicionar casos, eles entram no mesmo diff que vai para o PR.
   - Invoque o subagente **`test-runner`** passando os specs/filtros relevantes a esta branch (ex.: `dotnet test --filter ...`, `npx ng test --watch=false --include='**/arquivo.spec.ts'`, ou o novo teste E2E isolado) para executá-los e resumir o resultado — não peça a ele para rodar a suíte inteira.
3. **Se o diff desta branch tocar `CLAUDE.md`, `.claude/conventions/**`, `.claude/skills/**`, `.claude/hooks/**` ou `.claude/agents/**`**, invoque o subagente **`docs-consistency-checker`** apontando o diff (`git diff main...HEAD`) para checar se a mudança deixou alguma referência desatualizada (caminho/script inexistente, hook não registrado, descrição de skill/agent que não bate mais com o conteúdo real, sintaxe de shell errada para o ambiente). Relatos que sejam bugs reais de referência devem ser corrigidos antes de seguir; achados que dependam de decisão de escopo (ex.: um agente novo sem ponto de acionamento automático) devem ser confirmados com o usuário, não decididos sozinho.
4. **Rode a revisão de código interna do Claude Code e aplique os ajustes.** Invoque a skill `code-review` sobre o diff desta branch (`git diff main...HEAD`) no nível de esforço `medium` (equilíbrio entre pegar bugs reais e não gerar ruído — `low` pode deixar passar algo, `high`/`max` inclui achados incertos demais para aplicar sem revisão humana) com a flag `--fix`, para que os achados (bugs de correção, simplificação, reuso, eficiência) já sejam aplicados ao working tree.
   - **Revalide depois de aplicar**: os ajustes da revisão podem alterar código-fonte, então rode `.claude/skills/finish-feature/scripts/validate-build.ps1` de novo e, se os arquivos alterados tiverem specs correspondentes, invoque o **`test-runner`** de novo nesses specs antes de seguir.
   - Se a revisão não encontrar nada (ou nada seguro para corrigir automaticamente), siga sem alterações — não force um ajuste.
   - O diff final que vai para o PR pode incluir essas correções além da implementação original — deixe isso explícito no passo de confirmação com o usuário e na descrição do PR.
5. **Atualize o README** se a feature corresponder a um item da seção "Requisitos do Projeto": ajuste o status (🟢/🟡/⚪) e garanta que o link da issue está presente.
6. **Confirme com o usuário antes de commitar/dar push** — commitar e enviar código para o GitHub são ações que afetam o repositório remoto; siga o padrão de mensagem de commit definido em `CLAUDE.md`: `<tipo>: <descrição> [#<numero-da-issue>]` (ex.: `feat: adiciona busca e substituição de texto [#12]`). Se a revisão de código do passo 4 tiver aplicado algo, resuma o que foi ajustado.
7. **Dê push da branch**:
   ```
   git push -u origin <branch>
   ```
8. **Abra o Pull Request** para `main`, usando a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, preenchendo "O que foi feito" e "Como validar", e referenciando a issue com `Closes #<numero>`.
   - `gh` (GitHub CLI) está instalado nesta máquina. Use `gh pr create --repo <owner>/<repo> --title "..." --body "..."`. Se a autenticação falhar, rode `.claude/skills/start-feature/scripts/gh-auth-fallback.ps1` (mesmo script usado por `start-feature`, caminho relativo à raiz do repo) — não peça um token ao usuário antes de tentar essa via.
9. **Não faça merge do PR** — ele fica para revisão manual do usuário. Informe o link do PR e pare aqui.
10. **Quando o usuário aprovar e pedir o merge**: o merge deve ser um **merge normal** (merge commit, preservando os commits individuais da branch) — não usar squash merge nem rebase merge.
