# CLAUDE.md

Instruções para trabalhar neste repositório. Leia isto antes de implementar qualquer coisa.

## O que é o Caffeine

Editor de texto desktop para escrita longa (livros, roteiros, documentos com capítulos). É local-first: banco SQLite em arquivo na máquina do usuário, empacotado como app desktop via Electron. Veja `README.md` para stack completa e o status atual de cada requisito por fase (Fase 1/2/3).

Antes de propor uma feature nova, confira a seção "Requisitos do Projeto" do README para saber se ela já está prevista em alguma fase e qual o status atual.

## Arquitetura

@.claude/conventions/architecture.md

## Convenções e boas práticas já em uso

@.claude/conventions/code-style.md

## Workflow de desenvolvimento (Git/GitHub)

@.claude/conventions/git-workflow.md

## Validação antes de considerar algo pronto

- Não é necessário rodar a suíte completa (unitários de backend/frontend + E2E) localmente antes de cada commit ou antes de abrir o PR — isso já é custoso e demorado (especialmente os testes E2E do Playwright) e o CI (`.github/workflows/ci.yml`) cobre isso a cada PR/push. Rodar a suíte inteira localmente deixou de ser um passo obrigatório do fluxo.
- Durante a implementação, rode localmente apenas os testes relevantes à mudança (o spec/arquivo específico do backend ou frontend, ou o novo teste E2E isoladamente) para feedback rápido — não a suíte inteira. Para um bug de reposicionamento de cursor do ProseMirror ou outra race condition, ainda vale rodar o teste E2E novo repetidas vezes isoladamente para checar flakiness antes de commitar, mas sem precisar rodar toda a suíte de E2E junto.
- Sempre que possível, valide o fluxo end-to-end de verdade (subir backend + frontend via `scripts/dev-*.ps1` e exercitar a feature manualmente ou via `curl`), não só os testes automatizados — vários bugs reais deste projeto só apareceram nessa validação manual (cascade delete, encoding UTF-8 via curl, lockfile cross-platform).
- Ambiente de execução do Claude Code aqui é sandboxed e não abre janelas gráficas (`ELECTRON_RUN_AS_NODE=1` sempre setado) — a UI do Electron e interações visuais no navegador não podem ser validadas automaticamente; sinalize isso explicitamente em vez de assumir que funcionou.
- **Dados de teste E2E sempre dentro da pasta "Debug"**: qualquer pasta/documento criado por um teste E2E (via API, em `openDocumentWithContent` ou equivalente) deve nascer dentro de uma pasta raiz chamada `Debug` (buscar por título antes de criar, para reaproveitar entre specs/execuções), nunca direto na raiz da árvore — já aconteceu de dezenas de execuções acumularem centenas de pastas soltas no menu lateral do usuário. O mesmo vale para qualquer validação manual feita durante o desenvolvimento (curl/PowerShell contra a API): crie a pasta de teste dentro de `Debug`, não na raiz.

## Idioma

- **Português**: toda comunicação com o usuário — respostas em texto, mensagens de commit, issues, PRs, documentação (README, CLAUDE.md).
- **Inglês**: o código em si continua em inglês — nomes de variáveis, funções, classes, arquivos, e comentários dentro do código (quando necessários), seguindo a convenção já usada no projeto.

## O que evitar

- Não introduzir Docker para dev (decisão já tomada e documentada no README — SQLite é arquivo local, não há serviço de banco para containerizar nesta fase).
- Não começar a editar código de uma feature/correção sem antes ter a issue aberta e a branch correspondente criada (ver "Workflow de desenvolvimento" acima) — isso já aconteceu neste projeto e quebra a rastreabilidade entre código e issue.
- Não trocar Angular Signals por NgRx, nem a Clean Architecture pragmática por CQRS/MediatR, sem uma razão concreta que justifique a complexidade adicional.
- Não usar `window.prompt`/`window.confirm` para novas features de UI — isso já é uma dívida técnica identificada (ver README) que deve ser substituída por diálogos do PrimeNG, não expandida.
- Não fazer commit direto em `main` nem merge de PR sem revisão do usuário.
