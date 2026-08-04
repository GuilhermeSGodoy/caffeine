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
