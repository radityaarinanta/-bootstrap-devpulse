import { execSync } from 'child_process';

const CONVENTIONAL_TEMPLATES = {
  digest: [
    'feat(digest): add daily software architecture insight',
    'feat(digest): publish clean code design pattern',
    'feat(digest): catalog algorithm optimization tip',
    'docs(digest): sync technical architecture knowledge base'
  ],
  radar: [
    'chore(radar): update framework ecosystem performance metrics',
    'chore(radar): refresh language adoption confidence scores',
    'perf(radar): snapshot web runtime throughput benchmarks',
    'chore(radar): sync cloud-native technology radar index'
  ],
  telemetry: [
    'perf(telemetry): record cloud API latency and health benchmarks',
    'chore(telemetry): snapshot edge network ping telemetry',
    'perf(telemetry): update global DNS and gateway uptime records',
    'chore(telemetry): flush edge cluster probe status metrics'
  ],
  resources: [
    'docs(resources): catalog curated open-source developer tools',
    'docs(resources): index modern developer libraries and cheatsheets',
    'chore(resources): refresh open-source repository star metrics',
    'docs(resources): update precision vector asset bookmarks'
  ],
  pipeline: [
    'chore(data): refresh static telemetry data snapshot [skip ci]',
    'chore(sync): automated pipeline cycle execution',
    'chore(meta): synchronize system health records'
  ]
};

export function getConventionalCommitMessage(scope) {
  const list = CONVENTIONAL_TEMPLATES[scope] || CONVENTIONAL_TEMPLATES.pipeline;
  return list[Math.floor(Math.random() * list.length)];
}

export function executeGitCommit(filePath, message, authorName, authorEmail, commitDateIso = null) {
  try {
    execSync(`git add "${filePath}"`, { stdio: 'pipe' });
    
    const diff = execSync('git diff --staged', { encoding: 'utf-8' });
    if (!diff || diff.trim() === '') {
      return false;
    }
    
    let commitCmd = `git commit -m "${message}"`;
    if (authorName && authorEmail) {
      commitCmd = `git -c user.name="${authorName}" -c user.email="${authorEmail}" commit -m "${message}"`;
    }
    
    const env = { ...process.env };
    if (commitDateIso) {
      env.GIT_AUTHOR_DATE = commitDateIso;
      env.GIT_COMMITTER_DATE = commitDateIso;
    }

    execSync(commitCmd, { env, stdio: 'pipe' });
    console.log(`[GIT_OK] ${message} -> ${filePath}`);
    return true;
  } catch (err) {
    return false;
  }
}
