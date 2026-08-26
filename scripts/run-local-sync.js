/**
 * Local sync runner for DevPulse
 */

import { runPipeline } from '../services/pipelineEngine.js';

console.log('[LOCAL_RUNNER] Initiating DevPulse local data synchronization...');
runPipeline({ autoCommit: false }).then(res => {
  console.log(`[LOCAL_RUNNER] Finished. Status: ${res.success ? 'SUCCESS' : 'FAILED'}`);
});
