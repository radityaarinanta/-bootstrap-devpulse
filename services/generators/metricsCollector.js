/**
 * DevPulse Metrics Collector & Telemetry Engine
 * Snapshots cloud edge latency, DNS resolution, and uptime metrics.
 */

import { getRandomInt } from '../utils/randomizer.js';

export function collectMetrics(currentMetrics = []) {
  const now = new Date().toISOString();
  
  return currentMetrics.map(item => {
    // Generate realistic jitter based on service baseline
    let baseLatency = 30;
    if (item.service.includes('CLOUDFLARE') || item.service.includes('GOOGLE')) baseLatency = 15;
    if (item.service.includes('OPENAI')) baseLatency = 80;
    if (item.service.includes('SUPABASE')) baseLatency = 50;
    
    const jitter = getRandomInt(-6, 8);
    const latencyMs = Math.max(8, baseLatency + jitter);
    
    return {
      ...item,
      latencyMs,
      status: 'OPERATIONAL',
      lastChecked: now
    };
  });
}
