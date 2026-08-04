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
   - Pendente: mover documentos entre pastas pela UI (drag-and-drop) — hoje só é possível via chamada direta à API (`PUT /api/nodes/{id}`); a validação de regras de movimentação já existe no backend.
2. ⚪ Escolha de diferentes temas de cores
   - Só o preset padrão do PrimeNG (Aura) está configurado; não há seletor de tema nem persistência da preferência do usuário.
3. 🟢 Criar/editar/deletar sub abas/capítulos em um projeto/documento ([#1](https://github.com/GuilhermeSGodoy/caffeine/issues/1))
   - Mesma base de CRUD de nós, com validação de hierarquia (capítulo só pode estar sob documento ou outro capítulo).
4. ⚪ Criar/editar/deletar comentários ao longo do texto (incluindo comentários internos)
   - Modelagem de dados já desenhada na arquitetura (`Comment` ancorado via mark do Tiptap), mas ainda não implementada.
5. 🟢 Criar/editar/deletar pastas para diferentes projetos, com seus próprios arquivos internos ou diretórios ([#1](https://github.com/GuilhermeSGodoy/caffeine/issues/1))
6. 🟡 Auto-save a cada x segundos ([#2](https://github.com/GuilhermeSGodoy/caffeine/issues/2))
   - Implementado com debounce fixo de 3 segundos + salvamento manual (`Ctrl+S`).
   - Pendente: tornar o intervalo configurável pelo usuário (hoje é fixo no código).
7. ⚪ Busca e substituição de texto (com regex opcional)
8. 🟢 Contador de palavras/caracteres em tempo real ([#2](https://github.com/GuilhermeSGodoy/caffeine/issues/2), [#5](https://github.com/GuilhermeSGodoy/caffeine/issues/5))
   - Backend calcula e persiste a contagem a cada salvamento; frontend recalcula localmente a cada alteração do editor (`onUpdate` do Tiptap) e reconcilia com o valor do backend após salvar.
9. 🟡 Atalhos de teclado (Ctrl + B, Ctrl + S, Ctrl + P etc) ([#2](https://github.com/GuilhermeSGodoy/caffeine/issues/2))
   - `Ctrl+S` implementado (força salvamento). `Ctrl+B`/`Ctrl+I` (negrito/itálico) já vêm de série do StarterKit do Tiptap.
   - Pendente: `Ctrl+P` e demais atalhos do produto; painel de ajuda/listagem de atalhos.
10. ⚪ Modo leitura/preview
11. ⚪ Tags/labels para organizar documentos/diretórios (definidas pelo usuário, com título e cor)
    - Modelagem (`Tag`/`NodeTag`) já prevista na arquitetura, ainda não implementada.
12. ⚪ Importação de arquivos (.txt, .md, .docx)
13. ⚪ Exportação em PDF básica (formato A4), com fundo branco, respeitando formatação do texto, quebra de páginas, espaçamentos e união dos diferentes blocos/capítulos/sub abas do documento
    - Pacote QuestPDF já instalado no backend; lógica de exportação ainda não escrita.
14. 🟡 Índice inteligente (em formato de menu lateral) ([#1](https://github.com/GuilhermeSGodoy/caffeine/issues/1))
    - A árvore lateral já reflete pastas/documentos/capítulos com CRUD via menu de contexto.
    - Pendente: navegação inteligente dentro do documento (ex: pular para um título/seção específico dentro de um capítulo longo).

**Bugs identificados** (🟢 corrigido, com issue linkada · sem marcação = ainda sem issue, abrir uma antes de corrigir, conforme workflow em `CLAUDE.md`):

- 🟢 Ao criar um novo documento ou capítulo, o conteúdo da pasta no menu lateral é recolhido ([#3](https://github.com/GuilhermeSGodoy/caffeine/issues/3))
- 🟢 Delay na contagem de letras e palavras (só atualiza após salvamente automático ou manual, quando deveria ser feito em tempo real) ([#5](https://github.com/GuilhermeSGodoy/caffeine/issues/5))
- É possível criar pastas/documentos/capítulos com o mesmo nome e, ao renomear, preenche o campo com o nome original
- É possível criar capítulos dentro de capítulos (seria melhor se capítulos fossem o fim do ramo da árvore)

**Demandas adicionais identificadas durante o desenvolvimento/validação** (fora da lista original; ainda sem issue — abrir uma antes de trabalhar, conforme workflow em `CLAUDE.md`):

- UX das ações de criar/renomear/excluir na árvore hoje usa `window.prompt`/`window.confirm` do navegador como placeholder — precisa ser substituído por diálogos do PrimeNG (`p-dialog`) antes de considerar a Fase 1 pronta para uso real.
- Bundle inicial do frontend passou do orçamento padrão do Angular (500kB) por causa do PrimeNG + Tiptap; o limite foi ajustado para 2MB em `angular.json` como solução temporária — vale revisitar com lazy loading de features antes de ir para produção.
- A janela do Electron não pôde ser validada visualmente durante o desenvolvimento (ambiente headless usado para implementar); validar manualmente com `./scripts/dev-electron.ps1`.
- Interface para visualização de projetos e documentos, além do menu lateral.

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
dotnet restore src/backend/Caffeine.sln

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
dotnet test src/backend/Caffeine.sln

# Testes do frontend (Vitest)
cd src/frontend
npx ng test --watch=false
```
