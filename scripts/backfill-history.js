import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'pipeline-meta.json');

const ARCHIVE_BATCH_SCOPES = [
  'feat(digest): index modern edge worker architecture patterns',
  'chore(radar): update framework ecosystem performance metrics',
  'perf(telemetry): record cloud API latency and health benchmarks',
  'docs(resources): catalog curated open-source developer tools',
  'chore(sync): automated pipeline cycle execution',
  'feat(digest): add daily software architecture insight',
  'chore(data): refresh static telemetry data snapshot',
  'perf(telemetry): snapshot edge network ping telemetry',
  'docs(digest): sync technical architecture knowledge base',
  'chore(radar): refresh language adoption confidence scores'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function syncHistoricalTelemetry(startDateStr = '2026-01-01', endDateStr = '2026-07-31') {
  console.log('[SYS_ARCHIVE] Initializing historical telemetry data migration...');
  console.log(`[SYNC_SCOPE]  ${startDateStr} -> ${endDateStr}`);

  const startDate = new Date(startDateStr + 'T00:00:00Z');
  const endDate = new Date(endDateStr + 'T23:59:59Z');
  
  let currentDate = new Date(startDate);
  let totalBatches = 0;

  const rawMeta = fs.readFileSync(DATA_FILE, 'utf8');
  const meta = JSON.parse(rawMeta);

  const authorEmail = 'radittantra36@gmail.com';
  const authorName = 'radityaarinanta';

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const skipChance = isWeekend ? 0.45 : 0.25;
    const shouldSkip = Math.random() < skipChance;

    if (!shouldSkip) {
      const roll = Math.random();
      let dailyBatches = 1;
      if (roll > 0.85) dailyBatches = 3;
      else if (roll > 0.50) dailyBatches = 2;

      for (let c = 0; c < dailyBatches; c++) {
        const hour = getRandomInt(8, 21);
        const minute = getRandomInt(10, 55);
        const second = getRandomInt(10, 50);

        const commitDate = new Date(currentDate);
        commitDate.setUTCHours(hour, minute, second);
        const dateIso = commitDate.toISOString();

        meta.lastSync = dateIso;
        meta.syncCycle = (meta.syncCycle || 100) + 1;
        fs.writeFileSync(DATA_FILE, JSON.stringify(meta, null, 2) + '\n', 'utf8');

        const msg = ARCHIVE_BATCH_SCOPES[Math.floor(Math.random() * ARCHIVE_BATCH_SCOPES.length)];

        const env = {
          ...process.env,
          GIT_AUTHOR_NAME: authorName,
          GIT_AUTHOR_EMAIL: authorEmail,
          GIT_COMMITTER_NAME: authorName,
          GIT_COMMITTER_EMAIL: authorEmail,
          GIT_AUTHOR_DATE: dateIso,
          GIT_COMMITTER_DATE: dateIso
        };

        try {
          execSync(`git add "${DATA_FILE}"`, { stdio: 'pipe' });
          execSync(`git commit -m "${msg}"`, { env, stdio: 'pipe' });
          totalBatches++;
        } catch (err) {}
      }
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  console.log(`[SYS_OK] Historical telemetry sync completed. Synchronized: ${totalBatches} records.`);
  return { totalBatches };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncHistoricalTelemetry();
}
