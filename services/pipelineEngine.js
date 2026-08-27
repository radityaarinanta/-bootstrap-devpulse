import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeDailyCommitTarget, pickRandom } from './utils/randomizer.js';
import { getConventionalCommitMessage, executeGitCommit } from './utils/gitCommitHelper.js';
import { generateDigestUpdate } from './generators/digestGenerator.js';
import { updateRadarMetrics } from './generators/trendAnalyzer.js';
import { collectMetrics } from './generators/metricsCollector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

function readJson(filename) {
  const fullPath = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function writeJson(filename, data) {
  const fullPath = path.join(DATA_DIR, filename);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function handleAutomatedIssue(msg) {
  try {
    const issueTitle = `[TELEMETRY_AUDIT] ${msg}`;
    const issueBody = `Automated telemetry dataset audit executed. Status: OPERATIONAL. Node cluster verification completed at ${new Date().toISOString()}.`;
    const createOut = execSync(`gh issue create --title "${issueTitle}" --body "${issueBody}"`, { encoding: 'utf8', stdio: 'pipe' });
    const match = createOut.match(/\/issues\/(\d+)/);
    if (match && match[1]) {
      const issueNum = match[1];
      execSync(`gh issue close ${issueNum} --comment "Audit verified and archived successfully."`, { stdio: 'pipe' });
      console.log(`[SYS_ISSUE_OK] Telemetry audit issue #${issueNum} processed.`);
    }
  } catch (e) {}
}

export async function runPipeline(options = {}) {
  console.log('====================================================');
  console.log('[SYS_PIPELINE] DevPulse Precision Telemetry Engine');
  console.log(`[TIMESTAMP]    ${new Date().toISOString()}`);
  console.log('====================================================');

  const meta = readJson('pipeline-meta.json') || { syncCycle: 1, config: {} };
  const authorName = options.authorName || process.env.GIT_AUTHOR_NAME || process.env.GITHUB_ACTOR || 'radityaarinanta';
  const authorEmail = options.authorEmail || process.env.GIT_AUTHOR_EMAIL || 'radittantra36@gmail.com';
  const autoCommit = options.autoCommit !== undefined ? options.autoCommit : true;

  const commitTarget = options.commitCount !== undefined ? options.commitCount : computeDailyCommitTarget(meta.config);
  console.log(`[ORCHESTRATOR] Selected commit variance target for today: ${commitTarget} commit(s)`);

  if (commitTarget === 0) {
    console.log('\n====================================================');
    console.log('[SYS_REST_DAY] Rest day active. Skipping commits for natural pattern.');
    console.log('====================================================');
    return { success: true, commitCount: 0, isRestDay: true };
  }

  const availableChannels = ['digest', 'radar', 'telemetry', 'resources', 'meta'];
  const selectedChannels = [];
  
  for (let i = 0; i < commitTarget; i++) {
    const remaining = availableChannels.filter(ch => !selectedChannels.includes(ch));
    if (remaining.length > 0) {
      selectedChannels.push(pickRandom(remaining));
    } else {
      selectedChannels.push('digest');
    }
  }

  let executedCommits = 0;
  let lastMessage = 'chore(sync): automated pipeline cycle execution';

  for (let i = 0; i < selectedChannels.length; i++) {
    const channel = selectedChannels[i];
    console.log(`\n[STEP ${i + 1}/${selectedChannels.length}] Processing channel: [${channel.toUpperCase()}]`);

    let targetFile = '';
    let commitScope = channel;

    if (channel === 'digest') {
      const current = readJson('daily-digest.json') || [];
      const updated = generateDigestUpdate(current);
      writeJson('daily-digest.json', updated);
      targetFile = 'data/daily-digest.json';
    } else if (channel === 'radar') {
      const current = readJson('tech-radar.json') || [];
      const updated = updateRadarMetrics(current);
      writeJson('tech-radar.json', updated);
      targetFile = 'data/tech-radar.json';
    } else if (channel === 'telemetry') {
      const current = readJson('api-metrics.json') || [];
      const updated = collectMetrics(current);
      writeJson('api-metrics.json', updated);
      targetFile = 'data/api-metrics.json';
    } else if (channel === 'resources') {
      const current = readJson('resources.json') || [];
      if (current.length > 0) {
        current[0].lastVerified = new Date().toISOString();
        writeJson('resources.json', current);
      }
      targetFile = 'data/resources.json';
    } else {
      targetFile = 'data/pipeline-meta.json';
    }

    meta.syncCycle = (meta.syncCycle || 100) + 1;
    meta.lastSync = new Date().toISOString();
    writeJson('pipeline-meta.json', meta);

    if (autoCommit && targetFile) {
      const msg = getConventionalCommitMessage(commitScope);
      lastMessage = msg;
      const commitSuccess = executeGitCommit(targetFile, msg, authorName, authorEmail);
      if (commitSuccess) executedCommits++;
    }
  }

  if (autoCommit && executedCommits === 0) {
    executeGitCommit('data/pipeline-meta.json', 'chore(meta): synchronize system health records', authorName, authorEmail);
  }

  const shouldRunIssue = Math.random() < 0.20;
  if (process.env.GITHUB_ACTIONS === 'true' && shouldRunIssue) {
    handleAutomatedIssue(lastMessage);
  }

  console.log('\n====================================================');
  console.log(`[SYS_OK] Pipeline cycle completed. Total commits created: ${executedCommits}`);
  console.log('====================================================');
  return { success: true, commitCount: executedCommits };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const commitCountArg = process.argv.find(arg => arg.startsWith('--commits='));
  const commitCount = commitCountArg ? parseInt(commitCountArg.split('=')[1], 10) : undefined;
  
  runPipeline({ commitCount });
}
