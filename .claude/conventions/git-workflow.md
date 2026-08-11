**Antes de editar qualquer arquivo de código para uma feature ou correção nova**, toda demanda começa com uma issue no GitHub e uma branch a partir de `main` (`feature/<numero>` ou `bugfix/<numero>`) — isso vale mesmo que o pedido pareça pequeno ou já diagnosticado em conversa. Use a skill `start-feature` para automatizar isso; não pule direto para a implementação. Use a skill `finish-feature` para validar, dar push e abrir o PR ao concluir.

Regras que valem independentemente de qual skill estiver em uso:

- Nunca commite ou faça push direto em `main` (bloqueado por hook) e nunca faça merge de PR sem revisão do usuário.
- Commit: `<tipo>: <descrição> [#<numero-da-issue>]`, uma única linha, sem corpo/parágrafo explicativo — validado automaticamente por hook (ex.: `feat: adiciona busca e substituição de texto [#12]`).
- Merge de PR aprovado é sempre **merge normal** (merge commit) — nunca squash nem rebase.
- README: ao concluir/avançar um item de "Requisitos do Projeto", "Bugs identificados" ou "Demandas adicionais", marque 🟢/🟡 e linke a issue — nunca remova a linha.
- CI (`.github/workflows/ci.yml`, build+test de backend, frontend e E2E) é a fonte de verdade da suíte completa — acompanhe o resultado no PR em vez de rodar tudo de novo localmente.
