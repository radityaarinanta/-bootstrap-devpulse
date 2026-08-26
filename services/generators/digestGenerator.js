/**
 * DevPulse Technical Digest Generator
 * Generates and updates dynamic architecture insights and code snippets.
 */

import { pickRandom, getRandomInt } from '../utils/randomizer.js';

const KNOWLEDGE_POOL = [
  {
    category: 'ARCH_PATTERN',
    tag: 'SYSTEM_DESIGN',
    title: 'Circuit Breaker State Machine with Exponential Fallback',
    summary: 'Prevent cascading microservice failures by isolating transient endpoint degradation with an automated recovery probe cycle.',
    code: `class CircuitBreaker {
  constructor(timeout = 3000, threshold = 5) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
    this.nextAttempt = Date.now();
  }
  async exec(fn) {
    if (this.state === 'OPEN' && Date.now() < this.nextAttempt) {
      throw new Error('[CIRCUIT_OPEN] Request fast-failed');
    }
    try {
      const res = await fn();
      this.reset();
      return res;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }
}`,
    language: 'javascript',
    readTime: '3 MIN'
  },
  {
    category: 'PERFORMANCE',
    tag: 'MEMORY_OPT',
    title: 'Zero-Copy Buffer Slicing in High-Throughput Streams',
    summary: 'Avoid memory churn and garbage collection spikes by utilizing ArrayBuffer views over deep payload clones.',
    code: `// Process binary telemetry frame without allocating new heap memory
function parseFrameHeader(buffer, offset = 0) {
  const view = new DataView(buffer, offset, 16);
  return {
    magic: view.getUint32(0, false),
    packetId: view.getUint16(4, false),
    payloadLength: view.getUint32(6, false),
    timestamp: Number(view.getBigUint64(8, false))
  };
}`,
    language: 'javascript',
    readTime: '2 MIN'
  },
  {
    category: 'SECURITY',
    tag: 'CRYPTOGRAPHY',
    title: 'Constant-Time String Comparison for HMAC Verification',
    summary: 'Mitigate timing attack vulnerabilities when authenticating webhooks and cryptographic signatures.',
    code: `import crypto from 'node:crypto';

export function verifyWebhookSignature(payload, signature, secret) {
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const bufferA = Buffer.from(computed, 'utf8');
  const bufferB = Buffer.from(signature, 'utf8');
  
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}`,
    language: 'javascript',
    readTime: '2 MIN'
  },
  {
    category: 'DATABASE',
    tag: 'POSTGRES_SQL',
    title: 'Concurrent Materialized View Refresh with Zero Table Locks',
    summary: 'Maintain real-time analytical reporting views without blocking active read/write transactions.',
    code: `-- Setup unique index requirement for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_telemetry_summary_uid 
ON mv_telemetry_hourly_summary (bucket_hour, service_id);

-- Refresh asynchronously without acquiring EXCLUSIVE lock
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_telemetry_hourly_summary;`,
    language: 'sql',
    readTime: '3 MIN'
  },
  {
    category: 'DEVOPS',
    tag: 'KUBERNETES',
    title: 'Graceful PreStop Lifecycle Hooks for Zero-Downtime Drains',
    summary: 'Ensure in-flight HTTP requests complete before SIGKILL termination during automated rollouts.',
    code: `lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 15 && /app/shutdown --graceful"]
terminationGracePeriodSeconds: 45`,
    language: 'yaml',
    readTime: '2 MIN'
  }
];

export function generateDigestUpdate(currentList = []) {
  const existingTitles = new Set(currentList.map(item => item.title));
  const candidate = KNOWLEDGE_POOL.find(item => !existingTitles.has(item.title)) || pickRandom(KNOWLEDGE_POOL);
  
  const newEntry = {
    id: `DIG-${getRandomInt(805, 999)}`,
    timestamp: new Date().toISOString(),
    category: candidate.category,
    tag: candidate.tag,
    title: candidate.title,
    summary: candidate.summary,
    code: candidate.code,
    language: candidate.language,
    readTime: candidate.readTime
  };
  
  // Keep latest 8 items
  const updated = [newEntry, ...currentList.filter(item => item.title !== newEntry.title)].slice(0, 8);
  return updated;
}
