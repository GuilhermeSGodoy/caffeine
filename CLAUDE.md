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
- **Cross-platform lockfiles**: `npm install`/`npm ci` gerados em Windows podem produzir um `package-lock.json` inconsistente com dependências opcionais nativas (ex.: pacotes `@napi-rs/*`/`@emnapi/*`) que só se manifesta no CI (Linux) com `npm ci` falhando por "package.json e package-lock.json fora de sincronia". Se isso acontecer de novo: apague `node_modules` e `package-lock.json` e rode `npm install` limpo, depois confirme com `rm -rf node_modules && npm ci` localmente antes de commitar o lockfile.
- **Orçamento de bundle do Angular**: foi ampliado em `angular.json` (de 500kB/1MB para 1MB/2MB) por causa do peso de PrimeNG + Tiptap. Se for aumentar mais, prefira antes investigar lazy loading de features — não apenas suba o limite de novo sem necessidade.
- **Atualizar CLAUDE.md, Hooks e Skills conforme a necessidade do projeto, visando melhorias no fluxo de trabalho**

## Workflow de desenvolvimento (Git/GitHub)

**Antes de editar qualquer arquivo de código para uma feature ou correção nova, execute o passo 1 e 2 abaixo — nessa ordem, sem exceção.** Isso vale mesmo que o pedido pareça pequeno ou que a causa raiz já tenha sido diagnosticada em conversa: diagnóstico e investigação (leitura de código, busca, exploração) não exigem issue/branch, mas a primeira edição de código sim. Use a skill `start-feature` para automatizar esses dois passos; não pule direto para a implementação.

1. **Toda feature/correção nova começa com uma issue** no GitHub, descrevendo o que será feito. Use o template em `.github/ISSUE_TEMPLATE/feature.md` (ou `bug.md` para correções).
2. **Branch**: crie a partir de `main`, seguindo o padrão `feature/<numero-da-issue>` (nova funcionalidade) ou `bugfix/<numero-da-issue>` (correção) — ex.: `feature/12`, `bugfix/15`. Nunca commite direto em `main`. O link com a issue não depende do nome da branch — é garantido pelo `[#<numero>]` na mensagem de commit e pelo `Closes #<numero>` no PR (itens 3 e 4).
3. **Commits**: prefixo semântico (`feat`, `fix`, `documentation`, `refactor`, `test`, `chore`, ou outro que fizer sentido) seguido de `:`, a descrição em português, e o número da issue entre colchetes ao final — formato `<tipo>: <descrição> [#<numero-da-issue>]` (ex.: `feat: adiciona busca e substituição de texto [#12]`).
4. **Pull Request**: ao concluir o desenvolvimento na branch, abra um PR para `main` referenciando a issue (ex.: `Closes #12` na descrição, usando o template em `.github/PULL_REQUEST_TEMPLATE.md`). O PR fica para revisão manual do usuário — não faça merge automaticamente.
5. **Merge**: ao ser aprovado, o merge do PR é sempre **squash merge**, com a mensagem de commit final seguindo o mesmo padrão do item 3 (`<tipo>: <descrição> [#<numero-da-issue>]`) — não usar a mensagem default gerada pelo GitHub a partir do título do PR sem ajustar ao padrão.
6. **README**: ao concluir (ou avançar) uma feature da lista de "Requisitos do Projeto", atualize o status (🟢/🟡/⚪) e o link da issue correspondente na seção correspondente do README. O mesmo vale para itens das listas "Bugs identificados" e "Demandas adicionais identificadas": ao corrigir/resolver um item, **não remova a linha** — marque com 🟢 e linke a issue correspondente, preservando o histórico do que já foi identificado e resolvido.
7. **CI**: todo PR roda `.github/workflows/ci.yml` (build+test de backend e frontend). Não abra PR para revisão sabendo que o CI está quebrado — rode `dotnet test` e `npx ng build && npx ng test --watch=false` localmente antes.

## Validação antes de considerar algo pronto

- Backend: `dotnet build` e `dotnet test` no `src/backend/Caffeine.sln` sem erros.
- Frontend: `npx ng build` e `npx ng test --watch=false` no `src/frontend` sem erros.
- Sempre que possível, valide o fluxo end-to-end de verdade (subir backend + frontend via `scripts/dev-*.ps1` e exercitar a feature manualmente ou via `curl`), não só os testes automatizados — vários bugs reais deste projeto só apareceram nessa validação manual (cascade delete, encoding UTF-8 via curl, lockfile cross-platform).
- Ambiente de execução do Claude Code aqui é sandboxed e não abre janelas gráficas (`ELECTRON_RUN_AS_NODE=1` sempre setado) — a UI do Electron e interações visuais no navegador não podem ser validadas automaticamente; sinalize isso explicitamente em vez de assumir que funcionou.

## Idioma

- **Português**: toda comunicação com o usuário — respostas em texto, mensagens de commit, issues, PRs, documentação (README, CLAUDE.md).
- **Inglês**: o código em si continua em inglês — nomes de variáveis, funções, classes, arquivos, e comentários dentro do código (quando necessários), seguindo a convenção já usada no projeto.

## O que evitar

- Não introduzir Docker para dev (decisão já tomada e documentada no README — SQLite é arquivo local, não há serviço de banco para containerizar nesta fase).
- Não começar a editar código de uma feature/correção sem antes ter a issue aberta e a branch correspondente criada (ver "Workflow de desenvolvimento" acima) — isso já aconteceu neste projeto e quebra a rastreabilidade entre código e issue.
- Não trocar Angular Signals por NgRx, nem a Clean Architecture pragmática por CQRS/MediatR, sem uma razão concreta que justifique a complexidade adicional.
- Não usar `window.prompt`/`window.confirm` para novas features de UI — isso já é uma dívida técnica identificada (ver README) que deve ser substituída por diálogos do PrimeNG, não expandida.
- Não fazer commit direto em `main` nem merge de PR sem revisão do usuário.
