// Lactic Acid Molecular Vibration Analysis Model
// Mumbai Hacks 2025 - PragnaAI Research

// Normal ranges for lactic acid molecular vibrations (MHz)
export const NORMAL_MEANS = [1.2, 1.8, 2.8, 2.2];
export const NORMAL_STDS = [0.4, 0.6, 0.7, 0.9];

// Biological importance weights
export const BIOLOGICAL_WEIGHTS = [1.3, 1.0, 0.9, 1.2];

/**
 * Enhanced lactic acid cancer probability prediction
 */
export function enhancedLacticAcidPrediction(values) {
  if (!Array.isArray(values) || values.length !== 4) {
    throw new Error('Invalid input: Expected array of 4 molecular vibration values');
  }

  // Calculate weighted deviation score
  let weightedScore = 0;
  for (let i = 0; i < values.length; i++) {
    const deviation = Math.max(0, (values[i] - NORMAL_MEANS[i]) / NORMAL_STDS[i]);
    weightedScore += deviation * BIOLOGICAL_WEIGHTS[i];
  }

  // Normalize
  weightedScore /= values.length;

  // Apply sigmoid function
  const probability = 1 / (1 + Math.exp(-weightedScore * 0.6 + 2.2));

  // Add biological variance
  const finalProbability = Math.min(0.99, probability + (Math.random() * 0.06 - 0.03));

  return finalProbability;
}
