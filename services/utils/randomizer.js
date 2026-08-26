/**
 * DevPulse Precision Randomizer Engine
 * Computes deterministic & randomized variances for commit frequencies,
 * telemetry jitters, and content generation.
 */

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function computeDailyCommitTarget(config = {}) {
  const min = config.minCommitsPerCycle !== undefined ? config.minCommitsPerCycle : 1;
  const max = config.maxCommitsPerCycle || 4;
  const skipProbability = config.skipProbability !== undefined ? config.skipProbability : 0.15; // 15% default chance of rest day
  
  const today = new Date();
  const dayOfWeek = today.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // 1. Check for Organic Rest Day / Skip Day (Hari Kosong)
  // Higher probability on weekends (30%), natural 12% on weekdays
  const effectiveSkipChance = isWeekend ? Math.max(skipProbability, 0.30) : skipProbability;
  if (Math.random() < effectiveSkipChance) {
    console.log('[VARIANCE] Organic rest day triggered (0 commits today).');
    return 0; // 0 commits = kotak kosong / abu-abu di GitHub
  }
  
  // 2. Normal active day commit distribution (1 to 4 commits)
  const roll = Math.random();
  if (roll < 0.25) return 1;       // 25% chance of 1 commit (hijau muda)
  if (roll < 0.65) return 2;       // 40% chance of 2 commits (hijau muda-sedang)
  if (roll < 0.90) return 3;       // 25% chance of 3 commits (hijau sedang)
  return 4;                        // 10% chance of 4 commits (hijau pekat)
}

export function getJitterDelayMs() {
  return getRandomInt(500, 2500);
}
