import { useMemo, useState, useId } from 'react';
import type { ColumnMeta } from '../../store/useDataStore';
import { detectOutliers } from '../../utils/statistics';
import { BoxSelect, ChevronDown } from 'lucide-react';

interface BoxPlotProps {
  dataset: any[];
  numericCols: ColumnMeta[];
}

interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  outliers: number[];
}

function computeBoxStats(values: number[]): BoxStats | null {
  if (values.length < 4) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q = (p: number) => {
    const idx = (p / 100) * (n - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  const q1 = q(25);
  const median = q(50);
  const q3 = q(75);
  const iqr = q3 - q1;
  const whiskerLow  = Math.max(sorted[0],  q1 - 1.5 * iqr);
  const whiskerHigh = Math.min(sorted[n-1], q3 + 1.5 * iqr);

  const outVals = detectOutliers(values, 1.8).map(o => o.value);

  const mean = values.reduce((a, b) => a + b, 0) / n;

  return {
    min: whiskerLow,
    q1,
    median,
    q3,
    max: whiskerHigh,
    mean,
    outliers: outVals.slice(0, 5),
  };
}

const SELECT_CLASS =
  'text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer max-w-[150px] truncate appearance-none pr-6';

/** Renders a horizontal box-and-whisker plot for a selected numeric column */
export function BoxPlotSummary({ dataset, numericCols }: BoxPlotProps) {
  const [colKey, setColKey] = useState(numericCols[0]?.key ?? '');
  const colId = useId();

  const col = numericCols.find(c => c.key === colKey);

  const { stats, range } = useMemo(() => {
    if (!col) return { stats: null, range: 0 };
    const values = dataset.map(r => Number(r[colKey])).filter(n => !isNaN(n));
    const stats = computeBoxStats(values);
    return { stats, range: stats ? stats.max - stats.min : 0 };
  }, [dataset, colKey, col]);

  if (numericCols.length === 0 || !stats) return null;

  // Normalise a value to [0, 100]% within [min, max]
  const pct = (v: number) =>
    range === 0 ? 50 : Math.max(0, Math.min(100, ((v - stats.min) / range) * 100));

  const fmtNum = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
    return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
  };

  const q1Pct     = pct(stats.q1);
  const medPct    = pct(stats.median);
  const q3Pct     = pct(stats.q3);
  const meanPct   = pct(stats.mean);

  const iqr = stats.q3 - stats.q1;
  const cv  = stats.mean !== 0 ? (Math.sqrt(iqr) / Math.abs(stats.mean) * 100).toFixed(1) : '—';

  return (
    <section className="card p-5 flex flex-col gap-4" aria-label={`Box plot summary for ${col?.label}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10" aria-hidden="true">
          <BoxSelect size={14} className="text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Five-Number Summary</h3>
        <div className="ml-auto relative">
          <label htmlFor={colId} className="sr-only">Select column</label>
          <select
            id={colId}
            value={colKey}
            onChange={e => setColKey(e.target.value)}
            className={SELECT_CLASS}
            aria-label="Column for box plot"
          >
            {numericCols.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Box-and-whisker plot */}
      <div
        className="relative h-14 flex items-center"
        role="img"
        aria-label={`Box plot: min ${fmtNum(stats.min)}, Q1 ${fmtNum(stats.q1)}, median ${fmtNum(stats.median)}, Q3 ${fmtNum(stats.q3)}, max ${fmtNum(stats.max)}`}
      >
        {/* Whisker line */}
        <div className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-gray-300 w-full" />

        {/* Left whisker cap */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-400 rounded-full"
          style={{ left: `${pct(stats.min)}%` }}
        />

        {/* Right whisker cap */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-400 rounded-full"
          style={{ left: `${pct(stats.max)}%` }}
        />

        {/* IQR box (Q1 → Q3) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-9 rounded-lg border-2 border-primary/70 bg-primary/10"
          style={{
            left: `${q1Pct}%`,
            width: `${q3Pct - q1Pct}%`,
          }}
        />

        {/* Median line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-9 bg-primary rounded-sm z-10"
          style={{ left: `calc(${medPct}% - 2px)` }}
          title={`Median: ${fmtNum(stats.median)}`}
        />

        {/* Mean diamond */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-warning border-2 border-white rounded-sm rotate-45 z-10 shadow-sm"
          style={{ left: `calc(${meanPct}% - 6px)` }}
          title={`Mean: ${fmtNum(stats.mean)}`}
        />

        {/* Outlier dots */}
        {stats.outliers.map((ov, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-danger/70 border border-danger z-20"
            style={{ left: `calc(${pct(ov)}% - 5px)` }}
            title={`Outlier: ${fmtNum(ov)}`}
          />
        ))}
      </div>

      {/* X axis labels */}
      <div className="relative h-5 text-xs text-gray-400 select-none">
        <span className="absolute" style={{ left: `${pct(stats.min)}%`, transform: 'translateX(-50%)' }}>
          {fmtNum(stats.min)}
        </span>
        <span className="absolute font-medium text-primary" style={{ left: `${q1Pct}%`, transform: 'translateX(-50%)' }}>
          Q1
        </span>
        <span className="absolute font-bold text-primary" style={{ left: `${medPct}%`, transform: 'translateX(-50%)' }}>
          Med
        </span>
        <span className="absolute font-medium text-primary" style={{ left: `${q3Pct}%`, transform: 'translateX(-50%)' }}>
          Q3
        </span>
        <span className="absolute" style={{ left: `${pct(stats.max)}%`, transform: 'translateX(-50%)' }}>
          {fmtNum(stats.max)}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
        {[
          { label: 'Min',    value: fmtNum(stats.min)    },
          { label: 'Q1',     value: fmtNum(stats.q1)     },
          { label: 'Median', value: fmtNum(stats.median) },
          { label: 'Mean',   value: fmtNum(stats.mean)   },
          { label: 'Q3',     value: fmtNum(stats.q3)     },
          { label: 'Max',    value: fmtNum(stats.max)    },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-bold text-gray-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* IQR + outlier summary */}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
        <span>IQR: <span className="font-semibold text-gray-700">{fmtNum(iqr)}</span></span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/70 border border-danger inline-block" aria-hidden="true" />
          {stats.outliers.length} outlier{stats.outliers.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-warning border-2 border-white rounded-sm rotate-45 inline-block" aria-hidden="true" />
          Mean ◆
        </span>
      </div>
    </section>
  );
}
