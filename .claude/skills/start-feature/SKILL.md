---
name: start-feature
description: Use ao iniciar o desenvolvimento de uma feature, correção ou demanda nova neste projeto (Caffeine). Abre a issue no GitHub a partir do template, cria a branch correspondente e faz checkout nela — primeiro passo obrigatório do workflow descrito em CLAUDE.md antes de escrever qualquer código.
---

# start-feature

Workflow deste repositório (ver `CLAUDE.md`): toda feature/correção começa com uma issue no GitHub, e o desenvolvimento acontece numa branch nomeada `<numero-da-issue>-slug-curto`, nunca direto em `main`.

## Passos

1. **Confirme o escopo com o usuário** se ainda não estiver claro (o que será feito, qual requisito do README ela atende ou qual gap/bug ela resolve).
2. **Garanta que está em `main` atualizada**:
   ```
   git checkout main
   git pull
   ```
3. **Crie a issue no GitHub** usando a estrutura do template em `.github/ISSUE_TEMPLATE/feature.md` (ou `bug.md` se for uma correção). Preencha Contexto, Escopo, Critérios de aceite e Tarefas técnicas com base no que foi discutido com o usuário — não deixe os placeholders do template.
   - Use a API do GitHub (`gh issue create` se disponível, ou requisição HTTP autenticada) para criar a issue com título e corpo já preenchidos. Retenha o número da issue criada.
4. **Crie e faça checkout da branch** a partir de `main`, nomeada `<numero-da-issue>-<slug-curto-em-kebab-case>` (ex.: `12-busca-e-substituicao`):
   ```
   git checkout -b <numero>-<slug>
   ```
5. **Comece a implementar** seguindo as convenções de `CLAUDE.md` (testes de domínio, migrations, etc).

## Observação sobre o hook de proteção

Este projeto tem um hook (`.claude/settings.json` + `.claude/hooks/block-main-commit.js`) que bloqueia `git commit`/`git push` enquanto a branch atual for `main`. Criar a branch no passo 4 antes de começar a editar código evita cair nesse bloqueio.
