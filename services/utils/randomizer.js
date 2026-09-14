export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function getWeekNumber(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

export function evaluateWeeklySchedule(meta = {}) {
  const now = new Date();
  const weekNum = getWeekNumber(now);
  const todayDay = now.getUTCDay();

  let activeDays = meta.schedule?.activeDays;
  const recordedWeek = meta.schedule?.weekNumber;

  if (recordedWeek !== weekNum || !Array.isArray(activeDays) || activeDays.length !== 4) {
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    const shuffled = allDays.sort(() => 0.5 - Math.random());
    activeDays = shuffled.slice(0, 4).sort((a, b) => a - b);
  }

  const isActiveToday = activeDays.includes(todayDay);

  return {
    isActiveToday,
    activeDays,
    weekNumber: weekNum,
    todayDay
  };
}

export function computeDynamicCommitVolume(overrideRange = null) {
  if (overrideRange && typeof overrideRange === 'number') {
    return overrideRange;
  }

  const roll = Math.random();
  if (roll < 0.35) {
    return getRandomInt(4, 8);
  } else if (roll < 0.80) {
    return getRandomInt(9, 16);
  } else {
    return getRandomInt(17, 25);
  }
}

export function generateNaturalTimestampSequence(count, baseDate = new Date()) {
  const timestamps = [];
  const startHour = getRandomInt(7, 10);
  const startMinute = getRandomInt(5, 30);

  let current = new Date(baseDate);
  current.setUTCHours(startHour, startMinute, getRandomInt(10, 50), 0);

  for (let i = 0; i < count; i++) {
    timestamps.push(current.toISOString());
    const gapMinutes = getRandomInt(12, 45);
    const gapSeconds = getRandomInt(10, 55);
    current = new Date(current.getTime() + (gapMinutes * 60 * 1000) + (gapSeconds * 1000));
  }

  return timestamps;
}

export function getJitterDelayMs() {
  return getRandomInt(500, 2500);
}
