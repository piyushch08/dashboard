import type { ColumnMeta } from '../store/useDataStore';

// ─── Pearson Correlation ─────────────────────────────────────────────────────

/**
 * Computes the Pearson correlation coefficient r between two numeric arrays.
 * Returns 0 if either array is too short or has zero variance.
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : Math.max(-1, Math.min(1, num / den));
}

// ─── Linear Regression ──────────────────────────────────────────────────────

export interface RegressionResult {
  slope: number;
  intercept: number;
}

/**
 * Ordinary least-squares linear regression.
 * Returns slope and intercept of the best-fit line y = slope*x + intercept.
 */
export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = Math.min(x.length, y.length);
  if (n < 2) return { slope: 0, intercept: 0 };
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
    den += (x[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: meanY - slope * meanX };
}

// ─── Histogram ──────────────────────────────────────────────────────────────

export interface HistogramBin {
  label: string;
  count: number;
  x0: number;
  x1: number;
}

/**
 * Builds histogram bins using Sturges' rule (or a supplied binCount).
 * Returns an array of HistogramBin objects ordered from smallest to largest.
 */
export function createHistogramBins(values: number[], binCount?: number): HistogramBin[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ label: formatNum(min), count: values.length, x0: min, x1: max }];
  }

  const k = binCount ?? Math.max(5, Math.ceil(1 + 3.322 * Math.log10(values.length)));
  const w = (max - min) / k;

  const bins: HistogramBin[] = Array.from({ length: k }, (_, i) => {
    const x0 = min + i * w;
    const x1 = min + (i + 1) * w;
    return { label: formatNum(x0), count: 0, x0, x1 };
  });

  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / w), k - 1);
    bins[idx].count++;
  });

  return bins;
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)    return `${(n / 1_000).toFixed(1)}k`;
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
}

// ─── Outlier Detection ───────────────────────────────────────────────────────

export interface Outlier {
  value: number;
  zScore: number;
}

/**
 * Returns values whose absolute z-score exceeds `threshold` (default 2σ).
 * Sorted by z-score descending, capped at 5 results.
 */
export function detectOutliers(values: number[], threshold = 2): Outlier[] {
  if (values.length < 4) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return [];
  return values
    .map(v => ({ value: v, zScore: Math.abs((v - mean) / stdDev) }))
    .filter(o => o.zScore > threshold)
    .sort((a, b) => b.zScore - a.zScore)
    .slice(0, 5);
}

// ─── Skewness ───────────────────────────────────────────────────────────────

/**
 * Pearson's moment coefficient of skewness (g1).
 * Positive = right-skewed, negative = left-skewed.
 */
export function computeSkewness(values: number[]): number {
  const n = values.length;
  if (n < 3) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  const m3 = values.reduce((s, v) => s + (v - mean) ** 3, 0) / n;
  return m3 / stdDev ** 3;
}

// ─── Auto Insights ───────────────────────────────────────────────────────────

export interface DataInsight {
  type: 'outlier' | 'skew' | 'correlation' | 'summary';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  body: string;
  column?: string;
}

/**
 * Generates up to 8 statistical insights from the dataset.
 * Covers: outliers, skewness, strong correlations, and a summary.
 */
export function generateInsights(dataset: any[], numericCols: ColumnMeta[]): DataInsight[] {
  const insights: DataInsight[] = [];

  // Per-column outlier & skewness
  for (const col of numericCols) {
    const values: number[] = [];
    for (let k = 0; k < dataset.length; k++) {
      const val = Number(dataset[k][col.key]);
      if (!isNaN(val)) values.push(val);
    }
    
    if (values.length < 4) continue;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    // Outlier insight
    const outliers = detectOutliers(values);
    if (outliers.length > 0) {
      insights.push({
        type: 'outlier',
        severity: outliers[0].zScore > 3 ? 'critical' : 'warning',
        title: `${col.label}: ${outliers.length} outlier${outliers.length > 1 ? 's' : ''} detected`,
        body: `Extreme value: ${outliers[0].value.toLocaleString()} (z = ${outliers[0].zScore.toFixed(2)}σ from mean)`,
        column: col.key,
      });
    }

    // Skewness insight
    const skew = computeSkewness(values);
    if (Math.abs(skew) > 1) {
      insights.push({
        type: 'skew',
        severity: 'info',
        title: `${col.label}: ${skew > 0 ? 'Right' : 'Left'}-skewed distribution`,
        body: `Mean ${mean.toFixed(2)} ${skew > 0 ? '>' : '<'} Median ${median.toFixed(2)} — skewness ${skew.toFixed(2)}`,
        column: col.key,
      });
    }
  }

  // Pairwise correlation insights
  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const xs: number[] = [];
      const ys: number[] = [];
      
      // Extract pairwise complete observations
      for (let k = 0; k < dataset.length; k++) {
        const x = Number(dataset[k][numericCols[i].key]);
        const y = Number(dataset[k][numericCols[j].key]);
        if (!isNaN(x) && !isNaN(y)) {
          xs.push(x);
          ys.push(y);
        }
      }
      
      const minLen = xs.length;
      if (minLen < 5) continue;
      const r = pearsonCorrelation(xs, ys);
      if (Math.abs(r) >= 0.7) {
        insights.push({
          type: 'correlation',
          severity: Math.abs(r) >= 0.9 ? 'critical' : 'info',
          title: `Strong ${r > 0 ? 'positive' : 'negative'} correlation`,
          body: `${numericCols[i].label} ↔ ${numericCols[j].label}: r = ${r.toFixed(3)}`,
        });
      }
    }
  }

  // Dataset summary
  if (numericCols.length > 0 && dataset.length > 0) {
    const col = numericCols[0];
    const vals: number[] = [];
    for (let k = 0; k < dataset.length; k++) {
      const val = Number(dataset[k][col.key]);
      if (!isNaN(val)) vals.push(val);
    }
    if (vals.length > 0) {
      insights.push({
        type: 'summary',
        severity: 'info',
        title: `${dataset.length.toLocaleString()} records · ${numericCols.length} numeric column${numericCols.length !== 1 ? 's' : ''}`,
        body: `${col.label} ranges from ${Math.min(...vals).toLocaleString()} to ${Math.max(...vals).toLocaleString()}`,
      });
    }
  }

  return insights.slice(0, 8);
}
