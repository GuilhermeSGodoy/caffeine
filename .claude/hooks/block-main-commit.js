const { execSync } = require('child_process');

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
  const isGitCommitOrPush = /\bgit\b[^\n]*\b(commit|push)\b/i.test(command);

  if (!isGitCommitOrPush) {
    process.exit(0);
  }

  let branch = '';
  try {
    branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    process.exit(0);
  }

  if (branch !== 'main') {
    process.exit(0);
  }

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Commit/push direto na branch "main" está bloqueado neste projeto. Crie uma branch a partir de uma issue (ex.: "feature/12" ou "bugfix/12") e trabalhe nela — veja o workflow de Git/GitHub descrito em CLAUDE.md.'
      }
    })
  );
  process.exit(0);
});
