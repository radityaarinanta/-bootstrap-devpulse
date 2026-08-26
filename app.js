/**
 * DEVPULSE - Precision Developer Telemetry & Instrument
 * Main App Entry Point
 */

import { $, $$, showToast } from './src/utils/dom.js';
import { appState } from './src/core/appState.js';
import { initWorkbench } from './src/components/WorkbenchComponent.js';
import { renderTelemetry, initTelemetryActions } from './src/components/TelemetryComponent.js';
import { renderContributionMatrix, initHeatmapActions } from './src/components/MatrixHeatmapComponent.js';
import { renderDigest } from './src/components/DigestComponent.js';
import { initGuideModal } from './src/components/GuideModal.js';

async function fetchDataset(filename, fallback = []) {
  try {
    const res = await fetch(`data/${filename}`);
    if (!res.ok) return fallback;
    return await res.json();
  } catch (e) {
    console.warn(`[WARN_FETCH] Falling back for ${filename}`);
    return fallback;
  }
}

async function initApplication() {
  console.log('[SYS_BOOT] Booting DevPulse Precision Instrument v1.4.0...');

  // 1. Fetch core datasets
  const [digest, metrics, meta] = await Promise.all([
    fetchDataset('daily-digest.json', [
      {
        id: 'DIG-801',
        category: 'ARCH_PATTERN',
        tag: 'SYSTEM_DESIGN',
        title: 'Idempotent API Consumer Pattern in Distributed Queues',
        summary: 'Implement message de-duplication at consumer boundaries using distributed Redis locks combined with deterministic hash keys.',
        code: '// Idempotency guard using distributed cache key\nasync function processEvent(event) {\n  const idempotencyKey = `evt_lock:${event.id}:${event.checksum}`;\n  const acquired = await redis.set(idempotencyKey, \'LOCKED\', \'NX\', \'EX\', 300);\n  if (!acquired) return { status: \'DUPLICATE_IGNORED\' };\n  return await executeBusinessLogic(event);\n}',
        readTime: '2 MIN'
      }
    ]),
    fetchDataset('api-metrics.json', [
      { service: 'GITHUB_API_REST', status: 'OPERATIONAL', latencyMs: 42, uptimePercent: 99.98, region: 'GLOBAL_EDGE', endpoint: 'api.github.com' },
      { service: 'CLOUDFLARE_EDGE_DNS', status: 'OPERATIONAL', latencyMs: 14, uptimePercent: 99.99, region: 'ANYCAST', endpoint: '1.1.1.1' },
      { service: 'NPM_REGISTRY', status: 'OPERATIONAL', latencyMs: 38, uptimePercent: 99.95, region: 'US_EAST', endpoint: 'registry.npmjs.org' },
      { service: 'SUPABASE_EDGE', status: 'OPERATIONAL', latencyMs: 56, uptimePercent: 99.92, region: 'EU_CENTRAL', endpoint: 'api.supabase.com' },
      { service: 'OPENAI_GATEWAY', status: 'OPERATIONAL', latencyMs: 85, uptimePercent: 99.89, region: 'US_WEST', endpoint: 'status.openai.com' },
      { service: 'GOOGLE_DNS_HTTPS', status: 'OPERATIONAL', latencyMs: 18, uptimePercent: 99.99, region: 'GLOBAL_ANYCAST', endpoint: 'dns.google' }
    ]),
    fetchDataset('pipeline-meta.json', { streakDays: 42, status: 'OPERATIONAL' })
  ]);

  appState.dailyDigest = digest;
  appState.apiMetrics = metrics;
  appState.meta = meta;

  // 2. Initialize UI modules
  initWorkbench();
  renderTelemetry(metrics);
  initTelemetryActions();
  renderContributionMatrix();
  initHeatmapActions();
  renderDigest(digest);
  initGuideModal();

  // 3. Navigation pad switching
  const navPads = $$('.nav-pad');
  const viewPanels = $$('.view-panel');

  navPads.forEach(pad => {
    pad.addEventListener('click', () => {
      const targetId = pad.getAttribute('data-target');
      navPads.forEach(p => p.classList.remove('active'));
      viewPanels.forEach(p => p.classList.remove('active'));

      pad.classList.add('active');
      const targetPanel = $(`#${targetId}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // 4. Trigger cycle simulation button
  const btnTriggerCycle = $('#btn-trigger-cycle');
  if (btnTriggerCycle) {
    btnTriggerCycle.addEventListener('click', () => {
      btnTriggerCycle.textContent = '[EXECUTING_CYCLE...]';
      showToast('CYCLE_EXECUTION_INITIATED');
      setTimeout(() => {
        btnTriggerCycle.textContent = '[TRIGGER LOCAL CYCLE]';
        showToast('LOCAL_PIPELINE_SYNCHRONIZED_OK');
      }, 1000);
    });
  }

  showToast('SYS_PULSE_READY');
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}
