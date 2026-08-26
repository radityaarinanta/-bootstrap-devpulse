/**
 * DevPulse Tech Radar & Trend Analyzer
 * Computes adoption confidence scores, radar quadrant movements, and throughput metrics.
 */

import { getRandomInt, pickRandom } from '../utils/randomizer.js';

export function updateRadarMetrics(currentList = []) {
  return currentList.map(item => {
    // Add micro jitter to confidence and trend
    const jitter = getRandomInt(-2, 3);
    const newConfidence = Math.min(99, Math.max(75, item.confidence + jitter));
    const trendNum = (parseFloat(item.trend) + (Math.random() * 0.8 - 0.4)).toFixed(1);
    const newTrend = (trendNum >= 0 ? `+${trendNum}%` : `${trendNum}%`);
    
    return {
      ...item,
      confidence: newConfidence,
      trend: newTrend
    };
  });
}
