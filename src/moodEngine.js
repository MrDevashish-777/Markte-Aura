/**
 * moodEngine.js
 * Converts live market data into a mood + enriched theme overrides.
 * No API keys here — this is pure business logic.
 */

/**
 * @param {object} params
 * @param {number} params.change      - Main asset daily % change
 * @param {number} params.secondaryChange - Secondary asset daily % change
 * @param {number[]} [params.changes] - Optional full basket of % changes
 * @param {'indian'|'forex'|'crypto'} [params.marketType]
 * @param {number} params.price       - Current price
 * @returns {{ mood: string, score: number, reasons: string[], overrides: object }}
 */
export function classifyMood(params) {
  const {
    change = 0,
    secondaryChange = 0,
    changes = [],
    marketType = 'indian',
    price = 0,
    label = 'Market',
  } = params;

  const baseChanges = [change, secondaryChange, ...changes]
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const uniqueChanges = baseChanges.length > 0 ? baseChanges : [0];

  const weights = uniqueChanges.map((_, i) => (i === 0 ? 0.45 : i === 1 ? 0.25 : 0.30 / Math.max(1, uniqueChanges.length - 2)));
  const composite = uniqueChanges.reduce((acc, c, i) => acc + c * weights[i], 0);

  const absChanges = uniqueChanges.map((c) => Math.abs(c));
  const maxSwing = Math.max(...absChanges);
  const avgAbsMove = absChanges.reduce((a, b) => a + b, 0) / absChanges.length;
  const positiveCount = uniqueChanges.filter((c) => c > 0).length;
  const breadth = positiveCount / uniqueChanges.length;
  const mean = uniqueChanges.reduce((a, b) => a + b, 0) / uniqueChanges.length;
  const variance = uniqueChanges.reduce((a, b) => a + (b - mean) ** 2, 0) / uniqueChanges.length;
  const dispersion = Math.sqrt(variance);

  const diverged = breadth > 0.35 && breadth < 0.65 && dispersion > 0.5;

  const thresholds = {
    indian: { chaosSwing: 2.4, chaosDispersion: 1.2, fear: -0.45, bullish: 0.45, calmAbs: 0.28, calmDispersion: 0.22 },
    forex: { chaosSwing: 1.1, chaosDispersion: 0.45, fear: -0.12, bullish: 0.12, calmAbs: 0.06, calmDispersion: 0.05 },
    crypto: { chaosSwing: 6.0, chaosDispersion: 3.2, fear: -1.4, bullish: 1.4, calmAbs: 0.9, calmDispersion: 0.75 },
  }[marketType] || { chaosSwing: 2.4, chaosDispersion: 1.2, fear: -0.45, bullish: 0.45, calmAbs: 0.28, calmDispersion: 0.22 };

  let mood;
  const reasons = [];

  if (maxSwing >= thresholds.chaosSwing || dispersion >= thresholds.chaosDispersion || (diverged && maxSwing > thresholds.chaosSwing * 0.7)) {
    mood = 'chaos';
    reasons.push(`${label} volatility elevated: ${maxSwing.toFixed(2)}% max swing`);
  }
  else if (composite <= thresholds.fear && breadth <= 0.45) {
    mood = 'fear';
    reasons.push(`${label} bearish breadth: ${(breadth * 100).toFixed(0)}% assets up`);
  }
  else if (composite >= thresholds.bullish && breadth >= 0.55) {
    mood = 'bullish';
    reasons.push(`${label} bullish breadth: ${(breadth * 100).toFixed(0)}% assets up`);
  }
  // Calm only when both direction and dispersion are compressed.
  else if (avgAbsMove <= thresholds.calmAbs && dispersion <= thresholds.calmDispersion) {
    mood = 'calm';
    reasons.push(`${label} low-vol regime: ${avgAbsMove.toFixed(2)}% avg move`);
  }
  else {
    mood = composite >= 0 ? 'bullish' : 'fear';
    reasons.push(`${label} directional bias: ${composite >= 0 ? '+' : ''}${composite.toFixed(2)}%`);
  }

  // Normalised sentiment 0-100
  const clampedComposite = Math.max(-10, Math.min(10, composite));
  const sentimentScore = Math.round(((clampedComposite + 10) / 20) * 100);

  // AI confidence
  const divergencePenalty = diverged ? 12 : 0;
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
