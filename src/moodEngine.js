/**
 * moodEngine.js
 * Converts live market data into a mood + enriched theme overrides.
 * No API keys here — this is pure business logic.
 */

/**
 * @param {object} params
 * @param {number} params.change      - Main asset daily % change
 * @param {number} params.secondaryChange - Secondary asset daily % change
 * @param {number} params.price       - Current price
 * @returns {{ mood: string, score: number, reasons: string[], overrides: object }}
 */
export function classifyMood(params) {
  const { change = 0, secondaryChange = 0, price = 0, label = 'Market' } = params;

  // Composite score: weighted average
  const composite = change * 0.7 + secondaryChange * 0.3;

  // Volatility proxy
  const maxSwing = Math.max(Math.abs(change), Math.abs(secondaryChange));

  // Divergence
  const diverged = Math.sign(change) !== Math.sign(secondaryChange) && maxSwing > 1;

  let mood;
  const reasons = [];

  // ── Chaos: extreme volatility OR strongly divergent markets ──
  if (maxSwing > 5 || (maxSwing > 3 && diverged)) {
    mood = 'chaos';
    reasons.push(`${label} volatility extreme: ${maxSwing.toFixed(2)}%`);
  }
  // ── Fear: strongly negative ──
  else if (composite < -1.5) {
    mood = 'fear';
    reasons.push(`${label} sentiment bearish: ${composite.toFixed(2)}%`);
  }
  // ── Bullish: strongly positive ──
  else if (composite > 1.2) {
    mood = 'bullish';
    reasons.push(`${label} sentiment bullish: +${composite.toFixed(2)}%`);
  }
  // ── Calm: low volatility ──
  else {
    mood = 'calm';
    reasons.push(`${label} consolidating: ${composite.toFixed(2)}%`);
  }

  // Normalised sentiment 0-100
  const clampedComposite = Math.max(-10, Math.min(10, composite));
  const sentimentScore = Math.round(((clampedComposite + 10) / 20) * 100);

  // AI confidence
  const divergencePenalty = diverged ? 15 : 0;
  const volPenalty = Math.min(30, Math.round(maxSwing * 3));
  const aiConfidence = Math.max(40, 95 - divergencePenalty - volPenalty);

  // Prediction window
  const predictionWindows = { bullish: '24H', fear: '6H', calm: '48H', chaos: '1H' };
  
  // Stability labels
  const stabilityMap = { bullish: 'Moderate', fear: 'Unstable', calm: 'Stable', chaos: 'Chaotic' };
  const stabilityColorMap = { bullish: '#eab308', fear: '#ef4444', calm: '#06b6d4', chaos: '#f59e0b' };

  const overrides = {
    sentiment: sentimentScore,
    sentimentLabel: mood.charAt(0).toUpperCase() + mood.slice(1),
    volatility: Math.min(100, Math.round(maxSwing * 8)),
    confidence: aiConfidence,
    score: `${sentimentScore}/100`,
    scoreChange: composite >= 0 ? `+${composite.toFixed(2)}%` : `${composite.toFixed(2)}%`,
    sentimentConfidence: `${aiConfidence}%`,
    marketStability: stabilityMap[mood],
    stabilityColor: stabilityColorMap[mood],
    predictionWindow: predictionWindows[mood],
    predictionColor: mood === 'fear' ? '#ef4444' : mood === 'bullish' ? '#22c55e' : mood === 'chaos' ? '#f59e0b' : '#06b6d4',
    trend: mood === 'bullish' ? 'Bullish' : mood === 'fear' ? 'Bearish' : mood === 'chaos' ? 'Chaotic' : 'Sideways',
  };

  return { mood, score: sentimentScore, reasons, overrides };
}

export const MOOD_AURORA = {
  bullish: { amplitude: 1.0, speed: 1.3, blend: 0.51 },
  fear:    { amplitude: 1.6, speed: 2.2, blend: 0.65 },
  calm:    { amplitude: 0.6, speed: 0.7, blend: 0.40 },
  chaos:   { amplitude: 2.0, speed: 3.5, blend: 0.75 },
};
