# Caffeine - Editor de Texto

## Stack do Projeto

- Frontend: TypeScript + Angular
- Backend: C# + .Net
- Banco de Dados: SQLite (arquivo local p/ o usuário)
- Processos de CI/CD do GitHub
- Agente de IA: Claude Code
- Testes unitários das regras de negócios
- Bibliotecas
  - Tiptap: editor de texto (incluindo Markdown)
  - PrimeNG: componentes UI
  - ASP.NET Core Web API: framework backend
  - Entity Framework Core: ORM
  - QuestPDF: exportação em PDF
  - Docker: contêineres p/ backend, banco de dados p/ desenvolvimento
  - Electon: geração de pacotes executáveis do app desktop

## Requisitos do Projeto

Legenda de status: 🟢 Concluído · 🟡 Em andamento · ⚪ Não iniciado

Cada item concluído ou em andamento é linkado à issue do GitHub que rastreou seu desenvolvimento. A partir de agora, todo novo trabalho (feature, bug ou demanda identificada) segue o workflow descrito em `CLAUDE.md`: abre-se uma issue primeiro, e o link entra aqui.

### Fase 1

1. 🟢 Criar/editar/deletar documentos ([#1](https://github.com/GuilhermeSGodoy/caffeine/issues/1))
   - CRUD completo via árvore lateral (criar, renomear, excluir com cascade) + edição de conteúdo via editor Tiptap.
2. 🟢 Escolha de diferentes temas de cores ([#9](https://github.com/GuilhermeSGodoy/caffeine/issues/9))
   - Seletor de temas na seção de configurações (ícone de engrenagem no menu lateral): Aura, Caffeine, Tokyo, Darkwood e Latte, com preview de cor e persistência no banco de dados.
3. 🟢 Criar/editar/deletar sub abas/capítulos em um projeto/documento ([#1](https://github.com/GuilhermeSGodoy/caffeine/issues/1))
   - Mesma base de CRUD de nós, com validação de hierarquia (capítulo só pode estar sob documento, e é sempre folha da árvore — não aceita filhos).
4. ⚪ Criar/editar/deletar comentários ao longo do texto (incluindo comentários internos)
   - Modelagem de dados já desenhada na arquitetura (`Comment` ancorado via mark do Tiptap), mas ainda não implementada.
5. 🟢 Criar/editar/deletar pastas para diferentes projetos, com seus próprios arquivos internos ou diretórios ([#1](https://github.com/GuilhermeSGodoy/caffeine/issues/1))
6. 🟢 Auto-save a cada x segundos ([#2](https://github.com/GuilhermeSGodoy/caffeine/issues/2))
   - Implementado com debounce fixo de 3 segundos + salvamento manual (`Ctrl+S`).
7. 🟢 Busca e substituição de texto ([#34](https://github.com/GuilhermeSGodoy/caffeine/issues/34))
   - Modal (`Ctrl+F` ou botão na toolbar) com busca literal, opção "diferenciar maiúsculas/minúsculas", navegação entre ocorrências e substituir/substituir tudo. Suporte a regex e busca através de todos os documentos/capítulos de uma pasta/projeto ficaram fora do escopo, registrados como pendências na Fase 2.
8. 🟢 Contador de palavras/caracteres em tempo real ([#2](https://github.com/GuilhermeSGodoy/caffeine/issues/2), [#5](https://github.com/GuilhermeSGodoy/caffeine/issues/5))
   - Backend calcula e persiste a contagem a cada salvamento; frontend recalcula localmente a cada alteração do editor (`onUpdate` do Tiptap) e reconcilia com o valor do backend após salvar.
9. 🟢 Atalhos de teclado (Ctrl + B, Ctrl + S, Ctrl + P etc) ([#2](https://github.com/GuilhermeSGodoy/caffeine/issues/2))
   - `Ctrl+S` implementado (força salvamento). `Ctrl+B`/`Ctrl+I` (negrito/itálico) já vêm de série do StarterKit do Tiptap.
10. ⚪ Modo leitura/preview
11. ⚪ Tags/labels para organizar documentos/diretórios (definidas pelo usuário, com título e cor)
    - Modelagem (`Tag`/`NodeTag`) já prevista na arquitetura, ainda não implementada.
12. ⚪ Importação de arquivos (.txt, .md, .docx)
13. ⚪ Exportação em PDF básica (formato A4), com fundo branco, respeitando formatação do texto, quebra de páginas, espaçamentos e união dos diferentes blocos/capítulos/sub abas do documento
    - Pacote QuestPDF já instalado no backend; lógica de exportação ainda não escrita.
14. 🟢 Índice inteligente (em formato de menu lateral) ([#1](https://github.com/GuilhermeSGodoy/caffeine/issues/1))
    - A árvore lateral já reflete pastas/documentos/capítulos com CRUD via menu de contexto.

**Bugs identificados** (🟢 corrigido, com issue linkada · sem marcação = ainda sem issue, abrir uma antes de corrigir, conforme workflow em `CLAUDE.md`):

- 🟢 Ao criar um novo documento ou capítulo, o conteúdo da pasta no menu lateral é recolhido ([#3](https://github.com/GuilhermeSGodoy/caffeine/issues/3))
- 🟢 Delay na contagem de letras e palavras (só atualiza após salvamente automático ou manual, quando deveria ser feito em tempo real) ([#5](https://github.com/GuilhermeSGodoy/caffeine/issues/5))
- 🟢 É possível criar pastas/documentos/capítulos com o mesmo nome e, ao renomear, preenche o campo com o nome original ([#7](https://github.com/GuilhermeSGodoy/caffeine/issues/7))
- 🟢 É possível criar capítulos dentro de capítulos (seria melhor se capítulos fossem o fim do ramo da árvore) ([#11](https://github.com/GuilhermeSGodoy/caffeine/issues/11))
- 🟢 Menu lateral cresce em largura conforme o tamanho do conteúdo, em vez de ter largura fixa com rolagem horizontal ([#13](https://github.com/GuilhermeSGodoy/caffeine/issues/13))
- 🟢 Comportamentos inconsistentes na quebra de páginas usando Ctrl + Enter: Ctrl + Enter numa página vazia não cria uma nova página, mas se eu tiver um caractere ou até mesmo uma linha em branco, a página é criada. Além disso, se eu volto numa página que já tem uma página seguinte, ao usar Ctrl + Enter, uma nova página entre a atual e a seguinte não é criada, apenas pulando o curso para a página que já existe. ([#28](https://github.com/GuilhermeSGodoy/caffeine/issues/28))
- 🟢 Ctrl + Enter numa página vazia não cria uma nova página (Ctrl + Enter funciona apenas se tiver pelo menos um caractere ou linha vazia na página). ([#30](https://github.com/GuilhermeSGodoy/caffeine/issues/30))
- 🟢 Ao excluir um documento, ele continua visível na interface (deveria voltar para a tela inicial com a mensagem "Selecione um documento ou capítulo na árvore para começar a escrever."). ([#32](https://github.com/GuilhermeSGodoy/caffeine/issues/32))

**Demandas adicionais identificadas durante o desenvolvimento/validação** (fora da lista original; ainda sem issue — abrir uma antes de trabalhar, conforme workflow em `CLAUDE.md`):

- 🟢 Avançado: criação de paginação padrão com margens pré-definidas em formato A4 e adicionar contagem de páginas total. ([#15](https://github.com/GuilhermeSGodoy/caffeine/issues/15))
  - Folha A4 visual centralizada com margens de 2,5cm, contagem de páginas no cabeçalho, quebra manual (`Ctrl+Enter`) e automática por bloco (nunca no meio de um parágrafo — bloco que não cabe migra inteiro para a próxima página), alinhamento de texto configurável (esquerda/direita/centro/justificado) e cor de espaço vazio mais escura por tema.
  - Limitações conhecidas: quebra automática só entre blocos (não há split no meio de um parágrafo, podendo deixar espaço em branco no fim de uma página); recálculo de layout é O(n) sobre todos os blocos a cada edição, podendo gerar jank em documentos muito longos; redimensionar a janela recalcula todas as quebras; um bloco maior que uma página inteira ainda estoura visualmente, sem tentativa de split; nenhuma paridade garantida com a futura exportação em PDF via QuestPDF (motor de layout independente). Evolução para quebra inteligente por linha registrada como demanda na Fase 2.
- UX das ações de criar/renomear/excluir na árvore hoje usa `window.prompt`/`window.confirm` do navegador como placeholder — precisa ser substituído por diálogos do PrimeNG (`p-dialog`) antes de considerar a Fase 1 pronta para uso real.
- Seleção de múltiplos itens com Ctrl e possibilitar deleção múltipla.
- Bundle inicial do frontend passou do orçamento padrão do Angular (500kB) por causa do PrimeNG + Tiptap; o limite foi ajustado para 2MB em `angular.json` como solução temporária — vale revisitar com lazy loading de features antes de ir para produção.
- A janela do Electron não pôde ser validada visualmente durante o desenvolvimento (ambiente headless usado para implementar); validar manualmente com `./scripts/dev-electron.ps1`.
- Interface para visualização de projetos e documentos, além do menu lateral.
- Mover documentos entre pastas pela UI (drag-and-drop) — hoje só é possível via chamada direta à API (`PUT /api/nodes/{id}`); a validação de regras de movimentação já existe no backend.
- Edição de nomes de pastas/documentos/capítulos inline, além da opção de clique com mouse.
- Refinar temas existentes e criar novas opções.
- Documentação/Swagger da API.
- Lixeira de pastas/documentos/capítulos, com opção de restauração para o escopo original.
- 🟢 Infraestrutura de testes E2E com Playwright, para validar layout/DOM real de navegador (identificada durante a investigação da #15, onde jsdom não conseguia flagrar o bug de renderização) ([#18](https://github.com/GuilhermeSGodoy/caffeine/issues/18))
- Estilizar e ajustar padding/overflow das barras de scroll do menu lateral.
- Salvar estado das pastas/documentos expandidos no menu lateral.
- Trocar nome do frontend de "Frontend" para "Caffeine" e adicionar um ícone customizado.
- Definir nova fonte padrão para o sistema.
- Auto-save: tornar o intervalo configurável pelo usuário (hoje é fixo no código).
- Atalhos do teclado: `Ctrl+P` e demais atalhos do produto; painel de ajuda/listagem de atalhos.
- Hover nos itens do menu lateral e botão de configurações.
- Configurações de página/editor de texto: hifenização automática.
- Configurações de página/editor de texto: espaçamento entre linhas e parágrafos.
- Aplicação de Zoom no editor de texto (e preview, se estiver implementado).
- Ordenação no menu lateral: padrão é por ordem de criação (crescente), mas é possível ordenar por nome (crescente ou decrescente), ordem de criação decrescente e padrão/manual em que o usuário reorganiza a ordem através de interface drag-and-drop (só tomar o cuidado para não correr o risco de mover pastas para dentro de outras pastas, talvez seja uma interface separada).
- Scrollar pro topo ao abrir um documento.
- Largura ajustável do menu lateral.
- Configurações: seletor de tema fecha ao fechar as configurações.
- Contagem de caracteres/palavras/páginas: quando tiver apenas um, usar a palavra no singular.
- Avançado: navegação inteligente dentro do documento (ex: pular para um título/seção específico dentro de um capítulo longo). Avaliar a criação de estruturas diferentes de documento: um sem a adição de capítulos internos, e outro em que o documento principal serve como uma estrutura para unir os capítulos internos num único documento, conforme preferência do usuário (possibilidade de usar drag-and-drop para a organização do conteúdo).
- 🟢 Subagentes dedicados de teste (`test-writer`/`test-runner`, em `.claude/agents/`) integrados ao `finish-feature`, e gate de cobertura mínima (80% linha/branch) no CI para `Caffeine.Domain` ([#36](https://github.com/GuilhermeSGodoy/caffeine/issues/36))
  - `test-runner` executa specs/filtros indicados e resume o resultado; `test-writer` revisa o diff de uma branch em busca de lacunas de teste, sem substituir o teste principal escrito durante a implementação. Infraestrutura de cobertura do frontend (`@vitest/coverage-v8`, configuração `ci` em `angular.json`) também pronta, mas com o gate ainda não ativado no CI — ver item abaixo.
- Bug `NG0205` (injector destruído): só aparece ao rodar a suíte completa do frontend com cobertura habilitada (`--coverage`), mesmo com todos os testes passando — bloqueia habilitar o gate de cobertura do frontend no CI ([#37](https://github.com/GuilhermeSGodoy/caffeine/issues/37))

### Fase 2

Todos os itens ⚪ **Não iniciado**.

1. ⚪ Paginação em diferentes formatos conforme escolha do usuário (A4 por padrão, ebook, outros formatos populares, customização por parte do usuário, incluindo margens, espaçamento de linhas, parágrafos etc)
2. ⚪ Estilos de formatação de texto padrão (cabeçalho, títulos, sub títulos, texto, citações etc) com diferentes possiblidades de fontes, tamanhos, cores, estilos de destaque, espaçamentos etc
3. ⚪ Criar/editar/deletar estilos de formatação de texto (cabeçalho, títulos, sub títulos, texto, citações etc) com diferentes possiblidades de fontes, tamanhos, cores, estilos de destaque, espaçamentos etc
4. ⚪ Possibilidade de usar Markdown para escrita do texto (configuração definida pelo usuário, aproveitando os estilos de formatação padrão ou customizados)
5. ⚪ Criar/editar/deletar templates de documento (incluindo formatação das páginas, margens e estilo de textos para capa, títulos, sub títulos, texto etc)
6. ⚪ Estatísticas gerais: palavras no documento, por capítulo/sub aba, tempo gasto, progresso dos dias em que o documento foi acessado
7. ⚪ Exportação em PDF (complementando o formato A4, ebook ou outros formatos convenientes), com fundo branco, respeitando formatação do texto, quebra de páginas, espaçamentos e união dos diferentes blocos/capítulos/sub abas do documento
8. ⚪ Índice inteligente interno do documento, gerado automaticamente
9. ⚪ Adicionar opções de responsividade.
10. ⚪ Sincronização com nuvem (não criar uma sincronização nativa, verificar a possibilidade de salvar/fazer backups periódicos/recuperar backups quando necessário no Google Drive ou OneDrive).
11. ⚪ Avançado: evoluir a paginação da Fase 1 (hoje com quebra automática por bloco) para quebra de página inteligente por linha, no nível de um editor de texto tradicional — quebra exatamente no limite disponível, inclusive no meio de um parágrafo, sem deixar espaço vazio evitável no fim de uma página. Envolve: medição por linha via `Range.getClientRects()` do DOM real do ProseMirror (não só a altura total do bloco); aplicação via Decorations do ProseMirror em vez de manipulação direta de `marginBottom`; recálculo incremental a partir da posição alterada pela transação (`transaction.mapping`), em vez de remedir o documento inteiro a cada edição; tratamento de blocos indivisíveis (imagens, tabelas) que continuam migrando inteiros para a próxima página mesmo com o motor de linha. Mesmo com essa evolução, não há garantia de paridade pixel-perfect com a paginação da exportação em PDF via QuestPDF — motor de layout do Chromium e motor de layout do QuestPDF/.NET nunca terão exatamente as mesmas métricas de fonte/kerning/hinting; a exportação em PDF continuará dependendo da própria paginação do QuestPDF, independente do que for feito aqui.
    - Decisão de arquitetura registrada para quando essa demanda for atacada: permanecer sobre Tiptap/ProseMirror + `contentEditable` do navegador como fonte de layout (evolução incremental do motor atual), e não migrar para um renderer bespoke baseado em `<canvas>` com motor de tipografia próprio (abordagem adotada pelo Google Docs desde ~2021, abandonando `contentEditable`). A alternativa de canvas dá controle total sobre quebra de linha sem depender do layout engine do navegador, mas é uma reescrita de múltiplas semanas/meses que descarta boa parte do ecossistema de extensões, acessibilidade nativa, IME e seleção que o Tiptap já resolve — desproporcional para o escopo deste app desktop single-user. Reavaliar essa decisão só se o motor incremental (Decorations + `Range.getClientRects()`) se mostrar insuficiente na prática.
12. ⚪ Branch protection no `main` exigindo o CI (`.github/workflows/ci.yml`) verde como condição para permitir merge de PR. Não configurável hoje: o repositório é privado e está no plano free do GitHub, que não libera *branch protection rules* para repos privados (só a partir do plano Pro, ou em qualquer plano se o repo for público). Faz sentido revisitar quando o app tiver uma versão estável e o repositório puder se tornar público.
13. ⚪ Suporte a expressões regulares na busca e substituição de texto do editor (Fase 1, [#34](https://github.com/GuilhermeSGodoy/caffeine/issues/34), implementou só busca literal).
14. ⚪ Busca e substituição de texto através de todos os documentos/capítulos de uma pasta/projeto (Fase 1, [#34](https://github.com/GuilhermeSGodoy/caffeine/issues/34), implementou só o documento/capítulo atualmente aberto).

### Fase 3

Todos os itens ⚪ **Não iniciado**.

1. ⚪ Modo foco com timer
2. ⚪ Snippets/blocos reutilizáveis/dicionários de termos comuns/recorrentes (exemplos: termos técnicos, nomes de personagens etc)
3. ⚪ Backup automático periódico
4. ⚪ Análise de gramática/ortografia (com uso de API externa)
5. ⚪ Histórico de versões
6. ⚪ Internacionalização (a princípio tendo apenas português e inglês)
7. ⚪ Exportação para outros formatos além de PDF (EPUB, Markdown, HTML etc)

## Desenvolvimento local

### Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/) (inclui npm)
- Ferramenta `dotnet-ef` (necessária só se for criar/alterar migrations do banco):

  ```powershell
  dotnet tool install --global dotnet-ef
  ```

Não é necessário instalar Docker nem SQLite separadamente — o banco é um arquivo local criado automaticamente pelo backend.

### Baixando o projeto

```powershell
git clone https://github.com/GuilhermeSGodoy/caffeine.git
cd caffeine
```

### Instalando as dependências

Cada parte do projeto tem seu próprio gerenciador de dependências. Rode a partir da raiz do repositório:

```powershell
# Backend (.NET) — restaura os pacotes NuGet
dotnet restore src/backend/Caffeine.slnx

# Frontend (Angular)
cd src/frontend
npm install
cd ../..

# Electron (opcional, só se for testar o empacotamento desktop)
cd src/electron
npm install
cd ../..
```

### Rodando localmente

Use um terminal separado para cada parte (todos os comandos abaixo a partir da raiz do repositório):

| Script | O que faz | Porta |
| --- | --- | --- |
| `./scripts/dev-backend.ps1` | API .NET com hot-reload (`dotnet watch run`) | `http://127.0.0.1:5000` |
| `./scripts/dev-frontend.ps1` | Angular com hot-reload (`ng serve`) | `http://localhost:4200` |
| `./scripts/dev-electron.ps1` | Opcional: abre a UI dentro da janela do Electron, apontando para o backend/frontend acima | — |

```powershell
./scripts/dev-backend.ps1
```

```powershell
./scripts/dev-frontend.ps1
```

Depois de subir os dois, acesse **<http://localhost:4200>** no navegador para usar a aplicação.

Para validar que o backend subiu corretamente:

```powershell
curl http://127.0.0.1:5000/health
# esperado: {"status":"ok"}
```

O banco SQLite de desenvolvimento fica em `.devdata/caffeine.db` (ignorado pelo Git). Para resetar o estado local, pare o backend e apague a pasta `.devdata`.

### Rodando os testes

```powershell
# Testes do backend (xUnit)
dotnet test src/backend/Caffeine.slnx

# Testes do frontend (Vitest)
cd src/frontend
npx ng test --watch=false

# Testes E2E do frontend (Playwright) — exige backend e frontend de dev já rodando
npm run e2e

# Cobertura de código
dotnet test src/backend/Caffeine.Tests/Caffeine.Tests.csproj -p:CollectCoverage=true -p:CoverletOutputFormat=cobertura
cd src/frontend
npx ng test --watch=false --coverage
```

Testes E2E (Playwright) validam layout/DOM real de navegador (Chromium), algo que os specs Angular/Vitest não conseguem — eles rodam em jsdom, onde `getBoundingClientRect` sempre retorna 0. Use Playwright para bugs de renderização/CSS que dependam de medição real de layout; specs Vitest continuam sendo a validação padrão para lógica de componentes/serviços.

O CI (`.github/workflows/ci.yml`) já aplica um gate de cobertura mínima (80% linha/branch) sobre `Caffeine.Domain` — a única camada do backend com teste unitário puro por convenção (ver `CLAUDE.md`); `Caffeine.Infrastructure` fica fora por não ter teste de integração hoje. O gate equivalente do frontend está pronto mas bloqueado por [#37](https://github.com/GuilhermeSGodoy/caffeine/issues/37) (ver "Demandas adicionais" da Fase 1).
