import { useMemo } from 'react';
import type { ColumnMeta } from '../../store/useDataStore';
import { pearsonCorrelation } from '../../utils/statistics';

interface CorrelationHeatmapProps {
  dataset: any[];
  numericCols: ColumnMeta[];
}

/** Interpolate between two RGB colors by factor t ∈ [0, 1] */
function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

const WHITE: [number, number, number] = [255, 255, 255];
const BLUE: [number, number, number]  = [79, 70, 229];   // indigo-600
const RED: [number, number, number]   = [220, 38, 38];   // red-600

function corrToBackground(r: number): string {
  const abs = Math.max(0, Math.min(1, Math.abs(r)));
  return r >= 0 ? lerpColor(WHITE, BLUE, abs) : lerpColor(WHITE, RED, abs);
}

function corrToTextColor(r: number): string {
  return Math.abs(r) > 0.45 ? '#ffffff' : '#374151';
}

function corrLabel(r: number): string {
  const abs = Math.abs(r);
  if (abs >= 0.9) return 'Very strong';
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'Negligible';
}

export function CorrelationHeatmap({ dataset, numericCols }: CorrelationHeatmapProps) {
  const matrix = useMemo<number[][]>(() => {
    return numericCols.map(colA =>
      numericCols.map(colB => {
        if (colA.key === colB.key) return 1;
        const xs = dataset.map(r => Number(r[colA.key])).filter(n => !isNaN(n));
        const ys = dataset.map(r => Number(r[colB.key])).filter(n => !isNaN(n));
        const len = Math.min(xs.length, ys.length);
        return pearsonCorrelation(xs.slice(0, len), ys.slice(0, len));
      })
    );
  }, [dataset, numericCols]);

  if (numericCols.length < 2) {
    return (
      <div className="card p-5 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-slate-500 text-center">
          Need at least 2 numeric columns for the correlation heatmap.
        </p>
      </div>
    );
  }

  const n = numericCols.length;
  // Responsive cell size: shrink when many columns
  const cellSize = Math.max(44, Math.min(72, Math.floor(480 / n)));
  const fontSize = cellSize < 52 ? 9 : 11;

  return (
    <section
      className="card p-5 overflow-auto"
      aria-label="Correlation heatmap for all numeric column pairs"
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Correlation Heatmap</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Pearson r — ranges from <span className="text-danger font-medium">−1</span> (red) to{' '}
          <span className="text-primary font-medium">+1</span> (blue)
        </p>
      </div>

      {/* Colour scale legend */}
      <div className="flex items-center gap-2 mb-4" aria-hidden="true">
        <span className="text-xs text-slate-600 font-medium">−1</span>
        <div
          className="h-3 flex-1 rounded-full"
          style={{
            background: `linear-gradient(to right, ${corrToBackground(-1)}, ${corrToBackground(0)}, ${corrToBackground(1)})`,
          }}
        />
        <span className="text-xs text-slate-600 font-medium">+1</span>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <table
          className="border-separate"
          style={{ borderSpacing: '3px' }}
          aria-label="Correlation matrix"
        >
          <thead>
            <tr>
              {/* Empty top-left corner */}
              <th style={{ width: '80px' }} />
              {numericCols.map(col => (
                <th
                  key={col.key}
                  className="text-xs text-slate-600 font-medium pb-1 text-center"
                  style={{ width: `${cellSize}px`, maxWidth: `${cellSize}px` }}
                  scope="col"
                  title={col.label}
                >
                  <span
                    className="block truncate"
                    style={{ fontSize: `${fontSize}px`, maxWidth: `${cellSize}px` }}
                  >
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericCols.map((rowCol, i) => (
              <tr key={rowCol.key}>
                {/* Row label */}
                <th
                  scope="row"
                  className="text-right pr-2 font-medium"
                  style={{ fontSize: `${fontSize}px`, color: '#6b7280', maxWidth: '80px' }}
                  title={rowCol.label}
                >
                  <span className="block truncate">{rowCol.label}</span>
                </th>

                {/* Cells */}
                {numericCols.map((colCol, j) => {
                  const r = matrix[i]?.[j] ?? 0;
                  const bg = corrToBackground(r);
                  const fg = corrToTextColor(r);
                  const isDiag = i === j;

                  return (
                    <td
                      key={colCol.key}
                      title={
                        isDiag
                          ? `${rowCol.label} (self)`
                          : `${rowCol.label} ↔ ${colCol.label}: r = ${r.toFixed(3)} — ${corrLabel(r)} ${r >= 0 ? 'positive' : 'negative'} correlation`
                      }
                      aria-label={
                        isDiag
                          ? `${rowCol.label}: self-correlation = 1`
                          : `${rowCol.label} vs ${colCol.label}: r = ${r.toFixed(2)}`
                      }
                      className="rounded-md transition-transform duration-150 hover:scale-110 hover:z-10 relative cursor-default"
                      style={{
                        backgroundColor: bg,
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        minWidth: `${cellSize}px`,
                      }}
                    >
                      <span
                        className="absolute inset-0 flex items-center justify-center font-bold select-none"
                        style={{ color: fg, fontSize: `${fontSize}px` }}
                        aria-hidden="true"
                      >
                        {isDiag ? '—' : r.toFixed(2)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
