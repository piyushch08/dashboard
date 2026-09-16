import { useState, useMemo, useId } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { ColumnMeta } from '../../store/useDataStore';
import { createHistogramBins } from '../../utils/statistics';
import { BarChart2 } from 'lucide-react';

interface HistogramProps {
  dataset: any[];
  numericCols: ColumnMeta[];
}

const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

const SELECT_CLASS =
  'text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer max-w-[130px] truncate';

export function Histogram({ dataset, numericCols }: HistogramProps) {
  const [colKey, setColKey] = useState(numericCols[0]?.key ?? '');
  const colId = useId();

  const col = numericCols.find(c => c.key === colKey);

  const { bins, mean, median, stdDev, meanBinLabel, medianBinLabel } = useMemo(() => {
    const empty = { bins: [], mean: 0, median: 0, stdDev: 0, meanBinLabel: '', medianBinLabel: '' };
    if (!col || !colKey) return empty;

    const values = dataset.map(r => Number(r[colKey])).filter(n => !isNaN(n));
    if (values.length === 0) return empty;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const bins = createHistogramBins(values);

    // Find the bin label closest to mean and median (by midpoint)
    const midpoint = (b: typeof bins[0]) => (b.x0 + b.x1) / 2;
    const closestBin = (target: number) =>
      bins.reduce((best, bin) =>
        Math.abs(midpoint(bin) - target) < Math.abs(midpoint(best) - target) ? bin : best
      , bins[0]);

    const meanBinLabel = bins.length > 0 ? closestBin(mean).label : '';
    const medianBinLabel = bins.length > 0 ? closestBin(median).label : '';

    return { bins, mean, median, stdDev, meanBinLabel, medianBinLabel };
  }, [dataset, colKey, col]);

  if (numericCols.length === 0) return null;

  const maxCount = bins.reduce((m, b) => Math.max(m, b.count), 0);

  return (
    <section
      className="chart-container card p-5 flex flex-col h-[380px]"
      aria-label={`Distribution histogram for ${col?.label ?? ''}. Mean: ${mean.toFixed(2)}, Median: ${median.toFixed(2)}.`}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10" aria-hidden="true">
            <BarChart2 size={14} className="text-primary" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Distribution</h3>
        </div>
        <label htmlFor={colId} className="sr-only">Select column for histogram</label>
        <select
          id={colId}
          value={colKey}
          onChange={e => setColKey(e.target.value)}
          className={SELECT_CLASS}
          aria-label="Column to show distribution for"
        >
          {numericCols.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Stats summary */}
      <div
        className="flex items-center gap-4 mb-3 flex-shrink-0"
        aria-label={`Statistics: mean ${mean.toFixed(2)}, median ${median.toFixed(2)}, standard deviation ${stdDev.toFixed(2)}`}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-danger" style={{ backgroundImage: 'repeating-linear-gradient(to right, #dc2626 0, #dc2626 4px, transparent 4px, transparent 7px)' }} aria-hidden="true" />
          <span className="text-xs text-slate-600">
            Mean: <span className="font-semibold text-gray-800">{mean.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-warning" style={{ backgroundImage: 'repeating-linear-gradient(to right, #d97706 0, #d97706 4px, transparent 4px, transparent 7px)' }} aria-hidden="true" />
          <span className="text-xs text-slate-600">
            Median: <span className="font-semibold text-gray-800">{median.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-gray-200 rounded-sm" aria-hidden="true" />
          <span className="text-xs text-slate-600">
            σ: <span className="font-semibold text-gray-800">{stdDev.toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#475569"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#475569"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, maxCount + 1]}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const bin = payload[0].payload as ReturnType<typeof createHistogramBins>[0];
                const pct = dataset.length > 0 ? ((bin.count / dataset.length) * 100).toFixed(1) : '0';
                return (
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs">
                    <p className="text-slate-600 mb-1">
                      Range:{' '}
                      <span className="font-bold text-slate-800">
                        {bin.x0.toFixed(bin.x0 % 1 ? 1 : 0)} – {bin.x1.toFixed(bin.x1 % 1 ? 1 : 0)}
                      </span>
                    </p>
                    <p className="text-slate-600">
                      Count: <span className="font-bold text-primary">{bin.count}</span>
                    </p>
                    <p className="text-slate-500">
                      Share: {pct}%
                    </p>
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]} 
              opacity={0.85} 
              isAnimationActive={true}
              animationDuration={400} animationBegin={0}
              animationEasing="ease-out"
            />

            {/* Mean reference line */}
            {meanBinLabel && (
              <ReferenceLine
                x={meanBinLabel}
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="4 3"
                label={{ value: 'μ', position: 'insideTopLeft', fontSize: 11, fill: '#dc2626', fontWeight: 700 }}
              />
            )}

            {/* Median reference line (only if different bin from mean) */}
            {medianBinLabel && medianBinLabel !== meanBinLabel && (
              <ReferenceLine
                x={medianBinLabel}
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 3"
                label={{ value: 'M', position: 'insideTopRight', fontSize: 11, fill: '#d97706', fontWeight: 700 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-slate-500 flex-shrink-0">
        {bins.length} bins · {dataset.length.toLocaleString()} values
      </p>
    </section>
  );
}
