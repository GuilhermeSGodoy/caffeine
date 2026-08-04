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
4. **Confirme com o usuário antes de commitar/dar push** — commitar e enviar código para o GitHub são ações que afetam o repositório remoto; siga as convenções de mensagem de commit (`feat:`, `fix:`, `documentation:` etc., ver `CLAUDE.md`).
5. **Dê push da branch**:
   ```
   git push -u origin <branch>
   ```
6. **Abra o Pull Request** para `main`, usando a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, preenchendo "O que foi feito" e "Como validar", e referenciando a issue com `Closes #<numero>`.
7. **Não faça merge do PR** — ele fica para revisão manual do usuário. Informe o link do PR e pare aqui.
