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
   - Use `gh issue create` se o GitHub CLI estiver instalado e autenticado.
   - **Se `gh` não estiver disponível** (verifique com `gh auth status`; neste ambiente historicamente não está instalado): use uma requisição HTTP autenticada à API do GitHub (`POST /repos/<owner>/<repo>/issues`). O token pode ser obtido do Git Credential Manager já configurado na máquina, sem precisar pedir nada ao usuário:
     ```
     git credential fill <<< $'protocol=https\nhost=github.com\n'
     ```
     Isso retorna `username=` e `password=` (um token OAuth `gho_...` do GitHub). Use esse valor como `Authorization: token <password>` no `curl`/requisição HTTP. Nunca imprima ou registre esse token em arquivos, commits ou na resposta ao usuário — use-o só na chamada em memória.
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
