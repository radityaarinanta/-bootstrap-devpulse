/**
 * DevPulse CI/CD Pipeline Engine & Multi-Commit Orchestrator
 * Executes randomized multi-step telemetry synchronization and updates project data.
 */

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
    console.error(`[ERROR_READ] Failed to read ${filename}: ${err.message}`);
    return null;
  }
}

function writeJson(filename, data) {
  const fullPath = path.join(DATA_DIR, filename);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export async function runPipeline(options = {}) {
  console.log('====================================================');
  console.log('[SYS_PIPELINE] DevPulse Precision Telemetry Engine');
  console.log(`[TIMESTAMP]    ${new Date().toISOString()}`);
  console.log('====================================================');

  const meta = readJson('pipeline-meta.json') || { syncCycle: 1, config: {} };
  const authorName = options.authorName || process.env.GIT_AUTHOR_NAME || process.env.GITHUB_ACTOR || 'DevPulse Engine';
  const authorEmail = options.authorEmail || process.env.GIT_AUTHOR_EMAIL || 'devpulse-telemetry@users.noreply.github.com';
  const autoCommit = options.autoCommit !== undefined ? options.autoCommit : true;

  // 1. Determine number of commits for this cycle (0 to 4)
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
  
  // Pick distinct channels up to commitTarget
  for (let i = 0; i < commitTarget; i++) {
    const remaining = availableChannels.filter(ch => !selectedChannels.includes(ch));
    if (remaining.length > 0) {
      selectedChannels.push(pickRandom(remaining));
    } else {
      selectedChannels.push('digest');
    }
  }

  let executedCommits = 0;

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
      // Touch resource star jitter or timestamp
      if (current.length > 0) {
        current[0].lastVerified = new Date().toISOString();
        writeJson('resources.json', current);
      }
      targetFile = 'data/resources.json';
    } else {
      targetFile = 'data/pipeline-meta.json';
    }

    // Always update metadata
    meta.syncCycle = (meta.syncCycle || 100) + 1;
    meta.lastSync = new Date().toISOString();
    writeJson('pipeline-meta.json', meta);

    if (autoCommit && targetFile) {
      const msg = getConventionalCommitMessage(commitScope);
      const commitSuccess = executeGitCommit(targetFile, msg, authorName, authorEmail);
      if (commitSuccess) executedCommits++;
    }
  }

  // Final commit for metadata if needed
  if (autoCommit && executedCommits === 0) {
    executeGitCommit('data/pipeline-meta.json', 'chore(meta): synchronize system health records', authorName, authorEmail);
  }

  console.log('\n====================================================');
  console.log(`[SYS_OK] Pipeline cycle completed. Total commits created: ${executedCommits}`);
  console.log('====================================================');
  return { success: true, commitCount: executedCommits };
}

// Auto-run if executed directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const commitCountArg = process.argv.find(arg => arg.startsWith('--commits='));
  const commitCount = commitCountArg ? parseInt(commitCountArg.split('=')[1], 10) : undefined;
  
  runPipeline({ commitCount });
}
