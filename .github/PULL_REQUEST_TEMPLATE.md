## Issue relacionada

Closes #<!-- número da issue -->

## O que foi feito

<!-- Resumo do que foi implementado/alterado nesta branch. -->

## Como validar

<!-- Passos para o revisor confirmar que funciona: comandos, telas, endpoints testados etc. -->

## Checklist

- [ ] `dotnet build` e `dotnet test` passam (`src/backend/Caffeine.sln`)
- [ ] `npx ng build` e `npx ng test --watch=false` passam (`src/frontend`)
- [ ] Teste automatizado novo cobrindo a feature/correção (backend e/ou frontend)
- [ ] Status da feature atualizado no README (se aplicável)
- [ ] Validado manualmente de ponta a ponta (não só testes automatizados)

## Merge

Este PR deve ser fechado com **squash merge**, com a mensagem de commit final no padrão `<tipo>: <descrição> [#<numero-da-issue>]` (ex.: `feat: adiciona busca e substituição de texto [#12]`) — não usar a mensagem default gerada pelo GitHub sem ajustar.
