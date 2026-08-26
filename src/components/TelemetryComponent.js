/**
 * Telemetry Component (Cloud APIs & Real-Time Ping Latency)
 */

import { $, $$, showToast } from '../utils/dom.js';

export function renderTelemetry(metrics = []) {
  const container = $('#telemetry-cards-container');
  if (!container) return;

  container.innerHTML = '';

  metrics.forEach(item => {
    const card = document.createElement('div');
    card.className = 'telemetry-card';

    let barClass = '';
    if (item.latencyMs > 70) barClass = 'high';
    else if (item.latencyMs > 35) barClass = 'medium';

    const barPercent = Math.min(100, Math.max(10, (item.latencyMs / 120) * 100));

    card.innerHTML = `
      <div class="telemetry-card-top">
        <span class="service-name">${item.service}</span>
        <span class="status-indicator">
          <span class="status-dot-sm"></span>
          ${item.status}
        </span>
      </div>
      <div class="telemetry-metric-row">
        <div class="latency-val" id="lat-${item.service}">
          ${item.latencyMs} <span class="unit">MS</span>
        </div>
        <span class="micro-label">${item.region}</span>
      </div>
      <div class="latency-bar-track">
        <div class="latency-bar-fill ${barClass}" id="fill-${item.service}" style="width: ${barPercent}%"></div>
      </div>
      <div class="telemetry-footer-meta">
        <span>UPTIME: ${item.uptimePercent}%</span>
        <span>${item.endpoint ? item.endpoint.replace('https://', '') : 'EDGE_OK'}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

export function initTelemetryActions() {
  const btnRunPing = $('#btn-run-ping-test');
  if (!btnRunPing) return;

  btnRunPing.addEventListener('click', async () => {
    btnRunPing.textContent = '[PROBING...]';
    btnRunPing.style.opacity = '0.7';

    showToast('RUNNING_EDGE_PROBE');

    // Simulate real-time ping jitter calculation
    const cards = $$('.telemetry-card');
    for (let i = 0; i < cards.length; i++) {
      const latencyElem = cards[i].querySelector('.latency-val');
      const fillElem = cards[i].querySelector('.latency-bar-fill');
      
      const newLatency = Math.floor(Math.random() * 55) + 12;
      if (latencyElem) {
        latencyElem.innerHTML = `${newLatency} <span class="unit">MS</span>`;
      }
      if (fillElem) {
        fillElem.style.width = `${Math.min(100, (newLatency / 100) * 100)}%`;
      }
    }

    setTimeout(() => {
      btnRunPing.textContent = '[RUN PING TEST]';
      btnRunPing.style.opacity = '1';
      showToast('PROBE_COMPLETE_ALL_OK');
    }, 600);
  });
}
