---
name: finish-feature
description: Use ao concluir o desenvolvimento de uma feature/correção nesta branch do Caffeine. Valida build e testes, faz push da branch e abre o Pull Request para main referenciando a issue correspondente, usando o template de PR — para revisão manual do usuário, sem merge automático.
---

# finish-feature

Último passo do workflow deste repositório (ver `CLAUDE.md`) antes de entregar uma feature/correção para revisão.

## Passos

1. **Confirme que não está em `main`** (`git branch --show-current`). Se estiver, algo saiu da ordem — volte ao workflow de `start-feature`.
2. **Valide localmente antes de abrir o PR** — não abra PR com CI sabidamente quebrado:
   ```
   dotnet build src/backend/Caffeine.sln
   dotnet test src/backend/Caffeine.sln
   cd src/frontend
   npx ng build
   npx ng test --watch=false
   cd ..
   ```
3. **Atualize o README** se a feature corresponder a um item da seção "Requisitos do Projeto": ajuste o status (🟢/🟡/⚪) e garanta que o link da issue está presente.
4. **Confirme com o usuário antes de commitar/dar push** — commitar e enviar código para o GitHub são ações que afetam o repositório remoto; siga o padrão de mensagem de commit definido em `CLAUDE.md`: `<tipo>: <descrição> [#<numero-da-issue>]` (ex.: `feat: adiciona busca e substituição de texto [#12]`).
5. **Dê push da branch**:
   ```
   git push -u origin <branch>
   ```
6. **Abra o Pull Request** para `main`, usando a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, preenchendo "O que foi feito" e "Como validar", e referenciando a issue com `Closes #<numero>`.
   - `gh` (GitHub CLI) está instalado nesta máquina. Use `gh pr create --repo <owner>/<repo> --title "..." --body "..."`. Se a autenticação/PATH falhar, siga o mesmo procedimento (`GH_TOKEN` via `git credential fill`, caminho completo do executável, fallback via PowerShell) descrito em `start-feature` — não peça um token ao usuário antes de tentar essa via.
7. **Não faça merge do PR** — ele fica para revisão manual do usuário. Informe o link do PR e pare aqui.
8. **Quando o usuário aprovar e pedir o merge**: o merge deve ser **squash merge**, com a mensagem de commit final seguindo o mesmo padrão do item 4 (`<tipo>: <descrição> [#<numero-da-issue>]`) — não aceite a mensagem default do GitHub (gerada a partir do título do PR + lista de commits) sem ajustar ao padrão.
