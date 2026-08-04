---
name: start-feature
description: Use ao iniciar o desenvolvimento de uma feature, correção ou demanda nova neste projeto (Caffeine). Abre a issue no GitHub a partir do template, cria a branch correspondente e faz checkout nela — primeiro passo obrigatório do workflow descrito em CLAUDE.md antes de escrever qualquer código.
---

# start-feature

Workflow deste repositório (ver `CLAUDE.md`): toda feature/correção começa com uma issue no GitHub, e o desenvolvimento acontece numa branch `feature/<numero-da-issue>` ou `bugfix/<numero-da-issue>`, nunca direto em `main`.

## Passos

1. **Confirme o escopo com o usuário** se ainda não estiver claro (o que será feito, qual requisito do README ela atende ou qual gap/bug ela resolve).
2. **Garanta que está em `main` atualizada**:
   ```
   git checkout main
   git pull
   ```
3. **Crie a issue no GitHub** usando a estrutura do template em `.github/ISSUE_TEMPLATE/feature.md` (ou `bug.md` se for uma correção). Preencha Contexto, Escopo, Critérios de aceite e Tarefas técnicas com base no que foi discutido com o usuário — não deixe os placeholders do template.
   - `gh` (GitHub CLI) está instalado nesta máquina. Use `gh issue create --repo <owner>/<repo> --title "..." --label bug --body "..."`.
   - **Se a sessão de shell não reconhecer `gh`** (PATH não recarregado após instalação — ex.: `command not found` no Git Bash mesmo com `gh` instalado): use o caminho completo do executável, `"/c/Program Files/GitHub CLI/gh.exe"`.
   - **Se `gh auth status` indicar que não há login ativo**: não use `gh auth login --with-token` — o token do Git Credential Manager normalmente não tem o escopo `read:org` que esse comando valida, e a autenticação falha mesmo com um token válido para a API. Em vez disso, exporte o token como variável de ambiente `GH_TOKEN`, que o `gh` usa diretamente sem validar escopos no momento do login:
     ```
     cred=$(git credential fill <<< $'protocol=https\nhost=github.com\n')
     export GH_TOKEN=$(echo "$cred" | grep '^password=' | cut -d= -f2-)
     ```
     Nunca imprima ou registre esse token em arquivos, commits ou na resposta ao usuário — use-o só na sessão de shell em memória.
   - **Como último recurso**, se `gh` genuinamente não estiver disponível: requisição HTTP autenticada à API do GitHub (`POST /repos/<owner>/<repo>/issues`) com esse mesmo token via `Authorization: token <token>`. Prefira **PowerShell** (`Invoke-RestMethod` + `ConvertTo-Json`) em vez de Bash+curl neste ambiente Windows — não há `jq`/`python3` instalados, e paths POSIX/backticks quebram facilmente ao montar o JSON manualmente em Git Bash.
   - Retenha o número da issue criada.
4. **Crie e faça checkout da branch** a partir de `main`, nomeada `feature/<numero-da-issue>` (feature) ou `bugfix/<numero-da-issue>` (correção):
   ```
   git checkout -b feature/<numero>
   ```
   ou
   ```
   git checkout -b bugfix/<numero>
   ```
5. **Comece a implementar** seguindo as convenções de `CLAUDE.md` (testes de domínio, migrations, mensagens de commit no formato `<tipo>: <descrição> [#<numero>]`, etc).

## Observação sobre o hook de proteção

Este projeto tem um hook (`.claude/settings.json` + `.claude/hooks/block-main-commit.js`) que bloqueia `git commit`/`git push` enquanto a branch atual for `main`. Criar a branch no passo 4 antes de começar a editar código evita cair nesse bloqueio.
