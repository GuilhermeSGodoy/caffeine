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

### Fase 1

1. Criar/editar/deletar documentos
2. Escolha de diferentes temas de cores
3. Criar/editar/deletar sub abas/capítulos em um projeto/documento
4. Criar/editar/deletar comentários ao longo do texto (incluindo comentários internos)
5. Criar/editar/deletar pastas para diferentes projetos, com seus próprios arquivos internos ou diretórios
6. Auto-save a cada x segundos
7. Busca e substituição de texto (com regex opcional)
8. Contador de palavras/caracteres em tempo real
9. Atalhos de teclado (Ctrl + B, Ctrl + S, Ctrl + P etc)
10. Modo leitura/preview
11. Tags/labels para organizar documentos/diretórios (definidas pelo usuário, com título e cor)
12. Importação de arquivos (.txt, .md, .docx)
13. Exportação em PDF básica (formato A4), com fundo branco, respeitando formatação do texto, quebra de páginas, espaçamentos e união dos diferentes blocos/capítulos/sub abas do documento
14. Índice inteligente (em formato de menu lateral)

### Fase 2

1. Paginação em diferentes formatos conforme escolha do usuário (A4 por padrão, ebook, outros formatos populares, customização por parte do usuário, incluindo margens, espaçamento de linhas, parágrafos etc)
2. Estilos de formatação de texto padrão (cabeçalho, títulos, sub títulos, texto, citações etc) com diferentes possiblidades de fontes, tamanhos, cores, estilos de destaque, espaçamentos etc
3. Criar/editar/deletar estilos de formatação de texto (cabeçalho, títulos, sub títulos, texto, citações etc) com diferentes possiblidades de fontes, tamanhos, cores, estilos de destaque, espaçamentos etc
4. Possibilidade de usar Markdown para escrita do texto (configuração definida pelo usuário, aproveitando os estilos de formatação padrão ou customizados)
5. Criar/editar/deletar templates de documento (incluindo formatação das páginas, margens e estilo de textos para capa, títulos, sub títulos, texto etc)
6. Estatísticas gerais: palavras no documento, por capítulo/sub aba, tempo gasto, progresso dos dias em que o documento foi acessado
7. Exportação em PDF (complementando o formato A4, ebook ou outros formatos convenientes), com fundo branco, respeitando formatação do texto, quebra de páginas, espaçamentos e união dos diferentes blocos/capítulos/sub abas do documento
8. Índice inteligente interno do documento, gerado automaticamente

### Fase 3

1. Modo foco com timer
2. Snippets/blocos reutilizáveis/dicionários de termos comuns/recorrentes (exemplos: termos técnicos, nomes de personagens etc)
3. Backup automático periódico
4. Análise de gramática/ortografia (com uso de API externa)
5. Histórico de versões
6. Internacionalização (a princípio tendo apenas português e inglês)
7. Exportação para outros formatos além de PDF (EPUB, Markdown, HTML etc)

## Desenvolvimento local

Requisitos: .NET SDK 10, Node.js 22+, npm.

Rodar cada parte em um terminal separado (na raiz do repositório):

```powershell
./scripts/dev-backend.ps1   # API .NET em http://127.0.0.1:5000, hot-reload via dotnet watch
./scripts/dev-frontend.ps1  # Angular em http://localhost:4200, hot-reload via ng serve
./scripts/dev-electron.ps1  # opcional: abre a UI dentro do shell Electron
```

Testes:

```powershell
dotnet test src/backend/Caffeine.sln
cd src/frontend && npx ng test --watch=false
```

O banco SQLite de desenvolvimento fica em `.devdata/caffeine.db` (ignorado pelo Git).
