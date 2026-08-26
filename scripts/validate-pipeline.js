/**
 * Integrity & schema validator for DevPulse data pipeline.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');

const REQUIRED_FILES = [
  'daily-digest.json',
  'tech-radar.json',
  'api-metrics.json',
  'resources.json',
  'pipeline-meta.json'
];

let hasError = false;

console.log('[VALIDATION] Checking integrity of pipeline datasets...');

for (const file of REQUIRED_FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Missing required data file: ${file}`);
    hasError = true;
    continue;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    console.log(`[PASS] ${file} is valid JSON`);
  } catch (err) {
    console.error(`[FAIL] ${file} contains syntax error: ${err.message}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n[VALIDATION_FAILED] Fix errors above before deploying.');
  process.exit(1);
} else {
  console.log('\n[VALIDATION_SUCCESS] All datasets intact and verified.');
  process.exit(0);
}
