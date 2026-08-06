const COMMIT_PATTERN = /^[A-Za-zÀ-ÿ]+:\s.+\s\[#\d+\]$/;

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const command = input?.tool_input?.command ?? '';
  const isGitCommit = /\bgit\b[^\n]*\bcommit\b/i.test(command);

  if (!isGitCommit) {
    process.exit(0);
  }

  // Uso de heredoc (mensagens multilinha "$(cat <<EOF ... EOF)") não é coberto pelo regex de
  // extração abaixo com segurança — em vez de arriscar falso bloqueio, deixamos passar sem
  // validar (a convenção de linha única já orienta a não usar esse formato aqui).
  if (command.includes('<<')) {
    process.exit(0);
  }

  const messageMatches = [...command.matchAll(/-m\s+(?:"((?:[^"\\]|\\.)*)"|'([^']*)')/g)];

  if (messageMatches.length === 0) {
    process.exit(0);
  }

  const deny = (reason) => {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason
        }
      })
    );
    process.exit(0);
  };

  if (messageMatches.length > 1) {
    deny(
      'Mensagem de commit com múltiplos "-m" (multi-parágrafo) não é permitida neste projeto — use uma única linha no formato "<tipo>: <descrição> [#<numero-da-issue>]" (ver CLAUDE.md).'
    );
    return;
  }

  const message = (messageMatches[0][1] ?? messageMatches[0][2] ?? '').trim();

  // Commits de merge (feitos manualmente com -m, fora do fluxo usual de `git merge`) não seguem
  // esse formato e não estão sujeitos a esta regra.
  if (/^merge\b/i.test(message)) {
    process.exit(0);
  }

  if (message.includes('\n') || !COMMIT_PATTERN.test(message)) {
    deny(
      `Mensagem de commit "${message}" não segue o formato exigido pelo CLAUDE.md: "<tipo>: <descrição> [#<numero-da-issue>]", em uma única linha (ex.: "fix: corrige bug X [#12]").`
    );
    return;
  }

  process.exit(0);
});
