import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  evaluateWeeklySchedule, 
  computeDynamicCommitVolume, 
  generateNaturalTimestampSequence, 
  pickRandom 
} from './utils/randomizer.js';
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

  const meta = readJson('pipeline-meta.json') || { syncCycle: 1, schedule: {} };
  const authorName = options.authorName || process.env.GIT_AUTHOR_NAME || process.env.GITHUB_ACTOR || 'radityaarinanta';
  const authorEmail = options.authorEmail || process.env.GIT_AUTHOR_EMAIL || 'radittantra36@gmail.com';
  const autoCommit = options.autoCommit !== undefined ? options.autoCommit : true;

  const schedule = evaluateWeeklySchedule(meta);
  meta.schedule = {
    weekNumber: schedule.weekNumber,
    activeDays: schedule.activeDays
  };

  const isManualOverride = options.commitCount !== undefined && options.commitCount !== null;

  if (!schedule.isActiveToday && !isManualOverride) {
    writeJson('pipeline-meta.json', meta);
    console.log(`[SYS_REST_DAY] Telemetry rest cycle active today (Day ${schedule.todayDay}). Active week slots: [${schedule.activeDays.join(',')}]. Skipping.`);
    console.log('====================================================');
    return { success: true, commitCount: 0, isRestDay: true };
  }

  const commitTarget = computeDynamicCommitVolume(options.commitCount);
  const timestamps = generateNaturalTimestampSequence(commitTarget);
  console.log(`[ORCHESTRATOR] Target commit batch for today: ${commitTarget} commit(s)`);

  const availableChannels = ['digest', 'radar', 'telemetry', 'resources', 'meta'];
  let executedCommits = 0;
  let lastMessage = 'chore(sync): automated pipeline cycle execution';

  for (let i = 0; i < commitTarget; i++) {
    const channel = availableChannels[i % availableChannels.length];
    const commitDate = timestamps[i] || new Date().toISOString();

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
        current[0].lastVerified = commitDate;
        writeJson('resources.json', current);
      }
      targetFile = 'data/resources.json';
    } else {
      targetFile = 'data/pipeline-meta.json';
    }

    meta.syncCycle = (meta.syncCycle || 100) + 1;
    meta.lastSync = commitDate;
    writeJson('pipeline-meta.json', meta);

    if (autoCommit && targetFile) {
      const msg = getConventionalCommitMessage(commitScope);
      lastMessage = msg;
      const commitSuccess = executeGitCommit(targetFile, msg, authorName, authorEmail, commitDate);
      if (commitSuccess) executedCommits++;
    }
  }

  if (autoCommit && executedCommits === 0) {
    executeGitCommit('data/pipeline-meta.json', 'chore(meta): synchronize system health records', authorName, authorEmail, timestamps[0]);
  }

  const shouldRunIssue = Math.random() < 0.15;
  if (process.env.GITHUB_ACTIONS === 'true' && shouldRunIssue) {
    handleAutomatedIssue(lastMessage);
  }

  console.log(`[SYS_OK] Pipeline cycle completed. Commits created: ${executedCommits}`);
  console.log('====================================================');
  return { success: true, commitCount: executedCommits };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const commitCountArg = process.argv.find(arg => arg.startsWith('--commits='));
  const commitCount = commitCountArg ? parseInt(commitCountArg.split('=')[1], 10) : undefined;
  
  runPipeline({ commitCount });
}
