/**
 * Matrix Heatmap Component (Precision Dot-Matrix Contribution Visualizer)
 */

import { $, showToast } from '../utils/dom.js';

export function renderContributionMatrix(options = {}) {
  const gridContainer = $('#matrix-grid-container');
  const totalCommitsElem = $('#stat-total-commits');
  const currentStreakElem = $('#stat-current-streak');
  const maxStreakElem = $('#stat-max-streak');
  const avgDailyElem = $('#stat-avg-daily');

  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  const totalWeeks = 52;
  const totalDays = totalWeeks * 7;
  let totalCommits = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Generate realistic organic variance pattern
  for (let i = 0; i < totalDays; i++) {
    const dot = document.createElement('div');
    dot.className = 'matrix-dot';

    // Organic random density calculation
    const rand = Math.random();
    let level = 0;
    let commitCount = 0;

    // Simulate 80% active days with natural variance
    if (rand > 0.22) {
      if (rand > 0.88) {
        level = 4;
        commitCount = Math.floor(Math.random() * 3) + 5; // 5-7 commits
      } else if (rand > 0.65) {
        level = 3;
        commitCount = Math.floor(Math.random() * 2) + 3; // 3-4 commits
      } else if (rand > 0.40) {
        level = 2;
        commitCount = 2;
      } else {
        level = 1;
        commitCount = 1;
      }
    }

    dot.classList.add(`lvl-${level}`);
    totalCommits += commitCount;

    if (commitCount > 0) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 0;
    }

    const dayOffset = totalDays - i;
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    dot.title = `${dateStr}: ${commitCount} commit(s)`;
    dot.addEventListener('click', () => {
      showToast(`[DATE: ${dateStr}] -> ${commitCount} COMMITS`);
    });

    gridContainer.appendChild(dot);
  }

  currentStreak = tempStreak > 0 ? tempStreak : 18;

  if (totalCommitsElem) totalCommitsElem.textContent = totalCommits.toLocaleString();
  if (currentStreakElem) currentStreakElem.textContent = `${currentStreak} DAYS`;
  if (maxStreakElem) maxStreakElem.textContent = `${maxStreak} DAYS`;
  if (avgDailyElem) avgDailyElem.textContent = `${(totalCommits / totalDays).toFixed(1)} / DAY`;
}

export function initHeatmapActions() {
  const userInput = $('#github-user-input');
  const btnFetchUser = $('#btn-fetch-gh-user');

  if (btnFetchUser && userInput) {
    btnFetchUser.addEventListener('click', () => {
      const username = userInput.value.trim() || 'active_dev';
      showToast(`ANALYZING_USER: ${username.toUpperCase()}`);
      renderContributionMatrix({ username });
    });
  }
}
