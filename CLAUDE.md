# CLAUDE.md

Instruções para trabalhar neste repositório. Leia isto antes de implementar qualquer coisa.

## O que é o Caffeine

Editor de texto desktop para escrita longa (livros, roteiros, documentos com capítulos). É local-first: banco SQLite em arquivo na máquina do usuário, empacotado como app desktop via Electron. Veja `README.md` para stack completa e o status atual de cada requisito por fase (Fase 1/2/3).

Antes de propor uma feature nova, confira a seção "Requisitos do Projeto" do README para saber se ela já está prevista em alguma fase e qual o status atual.

## Arquitetura

- **Backend** (`src/backend`, .NET): Clean Architecture pragmática em 4 projetos — `Caffeine.Domain` (entidades e regras de negócio puras, sem EF Core), `Caffeine.Infrastructure` (EF Core + SQLite, repositórios, integrações externas como QuestPDF), `Caffeine.Api` (controllers finos, DI, Program.cs), `Caffeine.Tests` (xUnit). Não introduza uma camada `Application`/CQRS/MediatR — não se justifica para este escopo (app desktop single-user).
- **Frontend** (`src/frontend`, Angular): standalone components organizados por feature em `src/app/features/*`, serviços/estado compartilhado em `src/app/core/*`. Estado usa **Angular Signals nativos** (`signal()`/`computed()` em serviços) — não introduza NgRx. UI com PrimeNG, editor de texto com Tiptap.
- **Electron** (`src/electron`): em produção, spawna o backend self-contained como subprocesso local e descobre a porta dinâmica via stdout (`PORT=<n>`); em dev, o backend roda separadamente em porta fixa (`5000`) e o Electron não o gerencia.

Motivo de cada decisão está registrado no histórico de commits e no README — não redecida a arquitetura sem necessidade real.

## Convenções e boas práticas já em uso

- **Domínio testável sem banco**: regras de negócio (validação de hierarquia de nós, cálculo de contagem de palavras, extração de texto de JSON do Tiptap) vivem em `Caffeine.Domain` como funções/classes estáticas puras, testadas com xUnit sem qualquer dependência de EF Core. Ao adicionar uma regra de negócio nova, siga esse padrão — não a esconda dentro de um controller ou de EF queries.
- **Migrations EF Core**: qualquer mudança de entidade em `Caffeine.Infrastructure` precisa de uma migration correspondente (`dotnet ef migrations add <Nome> --project src/backend/Caffeine.Infrastructure --startup-project src/backend/Caffeine.Api -o Data/Migrations`). As migrations são aplicadas automaticamente no startup do backend (`dbContext.Database.Migrate()`), então nunca é necessário rodar `dotnet ef database update` manualmente em dev.
- **Soft delete + cascade manual**: `Node` usa `IsDeleted` (query filter global), não exclusão física. Ao excluir um nó, os descendentes precisam ser marcados como excluídos explicitamente — e como o `GetTreeAsync` usa `AsNoTracking()` por performance, qualquer alteração em lote precisa buscar as entidades novamente com tracking (via `GetByIdAsync`) antes de salvar. Esse é um bug real que já ocorreu neste projeto — tome cuidado ao reutilizar entidades vindas de queries `AsNoTracking`.
- **Testes de domínio antes de infraestrutura**: ao implementar uma regra nova, escreva o teste unitário do `Caffeine.Domain` correspondente antes ou junto da implementação — não deixe para depois.
- **Teste automatizado obrigatório em toda feature/correção**: tanto backend (xUnit em `Caffeine.Tests`) quanto frontend (specs Angular/Vitest) — cobrindo o comportamento novo ou o bug corrigido, não só passando pelos testes existentes. Se o bug só se manifesta numa camada específica (ex.: perda de estado de UI, race condition), o teste deve reproduzir esse cenário nessa camada (ex.: um spec do serviço/store), mesmo que a causa raiz esteja em como uma biblioteca de terceiros é usada — isso evita regressão futura e documenta o comportamento esperado.
- **CORS**: a origem do frontend em dev (`http://localhost:4200`) está fixa em `Program.cs`. Se a porta do `ng serve` mudar, ajuste a policy de CORS.
- **Cross-platform lockfiles**: se o CI do frontend falhar no `npm ci` com "package.json e package-lock.json fora de sincronia" ou "Missing: @emnapi/..." (inconsistência conhecida de lockfile gerado no Windows) — ver skill `fix-frontend-lockfile`.
- **Orçamento de bundle do Angular**: foi ampliado em `angular.json` (de 500kB/1MB para 1MB/2MB) por causa do peso de PrimeNG + Tiptap. Se for aumentar mais, prefira antes investigar lazy loading de features — não apenas suba o limite de novo sem necessidade.
- **Atualizar CLAUDE.md, Hooks e Skills conforme a necessidade do projeto, visando melhorias no fluxo de trabalho**

## Workflow de desenvolvimento (Git/GitHub)

**Antes de editar qualquer arquivo de código para uma feature ou correção nova**, toda demanda começa com uma issue no GitHub e uma branch a partir de `main` (`feature/<numero>` ou `bugfix/<numero>`) — isso vale mesmo que o pedido pareça pequeno ou já diagnosticado em conversa. Use a skill `start-feature` para automatizar isso; não pule direto para a implementação. Use a skill `finish-feature` para validar, dar push e abrir o PR ao concluir.

Regras que valem independentemente de qual skill estiver em uso:

- Nunca commite ou faça push direto em `main` (bloqueado por hook) e nunca faça merge de PR sem revisão do usuário.
- Commit: `<tipo>: <descrição> [#<numero-da-issue>]`, uma única linha, sem corpo/parágrafo explicativo — validado automaticamente por hook (ex.: `feat: adiciona busca e substituição de texto [#12]`).
- Merge de PR aprovado é sempre **merge normal** (merge commit) — nunca squash nem rebase.
- README: ao concluir/avançar um item de "Requisitos do Projeto", "Bugs identificados" ou "Demandas adicionais", marque 🟢/🟡 e linke a issue — nunca remova a linha.
- CI (`.github/workflows/ci.yml`, build+test de backend, frontend e E2E) é a fonte de verdade da suíte completa — acompanhe o resultado no PR em vez de rodar tudo de novo localmente.

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
