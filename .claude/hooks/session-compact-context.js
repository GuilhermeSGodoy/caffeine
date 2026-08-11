const { execSync } = require('child_process');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  let branch = '';
  try {
    branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    process.exit(0);
  }

  let hasUncommittedChanges = false;
  try {
    hasUncommittedChanges = execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
  } catch {
    hasUncommittedChanges = false;
  }

  const lines = [
    `Branch atual: "${branch}".`,
    branch === 'main'
      ? 'Está em "main" — nenhuma edição de código deve começar sem antes criar uma issue e uma branch (skill "start-feature"); commit/push direto em "main" é bloqueado por hook.'
      : 'Lembrete do workflow deste repositório (CLAUDE.md): use a skill "finish-feature" antes de abrir o PR.',
    hasUncommittedChanges
      ? 'Há mudanças não commitadas no working tree — confirme se são intencionais antes de continuar.'
      : 'Working tree limpo.'
  ];

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: lines.join(' ')
      }
    })
  );
  process.exit(0);
});
