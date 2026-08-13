# Playwright MCP — validação visual da UI

Ferramenta auxiliar de desenvolvimento (não é feature do produto Caffeine). Complementa a suíte E2E automatizada que já cobre o CI — não a substitui, e nunca faz parte do `ci.yml`. Uso sempre manual, a pedido, durante o desenvolvimento.

Serve para contornar a limitação descrita em `CLAUDE.md`: o ambiente de execução do Claude Code aqui é sandboxed e não abre janela gráfica, então a UI (Electron/Angular) normalmente não pode ser validada visualmente. Com o Playwright MCP, é possível navegar/inspecionar/tirar screenshot da UI Angular real dentro da própria conversa.

Dois servidores configurados em `.mcp.json`, na raiz do repo:

## `playwright` — modo não assistido (headless)

Sobe um Chromium headless próprio, sem pré-requisito. Use quando quiser só o resultado (screenshots) sem precisar acompanhar em tempo real.

1. Rode `scripts/dev-frontend.ps1` (frontend em `http://localhost:4200`).
2. Peça a navegação/interação; o retorno vem como screenshots na conversa.

Para não poluir o contexto principal com o passo a passo verboso de snapshots/refs, prefira delegar esse roteiro ao subagente `ui-visual-validator` — ele executa a navegação e reporta só o resultado de forma concisa (mesmo padrão de `ci-failure-diagnostician`/`targeted-test-runner`).

## `playwright-live` — modo assistido (conectado ao seu browser)

Conecta via CDP a um browser que você já tem aberto, então a navegação acontece na sua tela em tempo real e você pode intervir/dar instruções no meio do processo.

1. Rode `scripts/dev-playwright-live-browser.ps1` — abre o Chrome já com `--remote-debugging-port=9222` e um perfil temporário descartável (apagado e recriado a cada execução, garantindo uma sessão sempre "pura"). Evite abrir o Chrome manualmente com a flag: se já houver uma instância do Chrome rodando em segundo plano, o novo processo reaproveita a instância existente e ignora a flag — o script contorna isso com um `--user-data-dir` dedicado.
2. Rode `scripts/dev-frontend.ps1`.
3. Peça a navegação usando o servidor `playwright-live`.

Esse modo depende de você acompanhar/interromper em tempo real — por isso não é delegado a um subagente (que só reportaria no final, sem a interação síncrona que é o ponto principal do modo live). Use-o direto na conversa principal.

## Limitações conhecidas

O Playwright fala com o browser via CDP — só alcança conteúdo web renderizado:

- Cobre: a UI Angular servida via `ng serve` (`localhost:4200`), e o conteúdo renderizado dentro da janela do Electron *se* o Electron for iniciado com `--remote-debugging-port`.
- Não cobre: diálogos nativos do sistema operacional (ex.: seletor de arquivo do Windows) nem o processo principal do Electron (menus nativos, IPC).

Essas limitações não têm solução via configuração — ficam registradas aqui, não resolvidas.
