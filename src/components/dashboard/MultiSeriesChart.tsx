import { useMemo, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { ColumnMeta } from '../../store/useDataStore';
import { Layers } from 'lucide-react';

interface MultiSeriesChartProps {
  dataset: any[];
  xColKey: string;
  numericCols: ColumnMeta[];
}

const SERIES_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#0891b2', '#9333ea'];

const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

/**
 * Overlays up to 4 numeric series on a single Composed chart.
 * Users toggle series on/off individually.
 */
export function MultiSeriesChart({ dataset, xColKey, numericCols }: MultiSeriesChartProps) {
  const MAX_SERIES = 4;
  const available = numericCols.slice(0, MAX_SERIES);

  const [activeSeries, setActiveSeries] = useState<Set<string>>(
    () => new Set(available.slice(0, 2).map(c => c.key))
  );
  const [chartMode, setChartMode] = useState<'bar' | 'line' | 'combo'>('combo');

  const chartData = useMemo(() => dataset.slice(0, 30), [dataset]);

  const toggleSeries = (key: string) => {
    setActiveSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (numericCols.length < 2) return null;

  const activeArray = Array.from(activeSeries);

  return (
    <section
      className="chart-container card p-5 flex flex-col h-[400px]"
      tabIndex={0}
      aria-label="Multi-series combination chart"
    >
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-accent/10" aria-hidden="true">
          <Layers size={14} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Combination Chart</h3>

        <div className="ml-auto flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5" role="group" aria-label="Chart mode">
          {(['bar', 'line', 'combo'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setChartMode(mode)}
              aria-pressed={chartMode === mode}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all capitalize ${
                chartMode === mode ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0" role="group" aria-label="Toggle series visibility">
        {available.map((col, i) => {
          const active = activeSeries.has(col.key);
          const color = SERIES_COLORS[i];
          return (
            <button
              key={col.key}
              onClick={() => toggleSeries(col.key)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                active ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-400'
              }`}
              style={active ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: active ? '#fff' : color }}
                aria-hidden="true"
              />
              {col.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey={xColKey} stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} orientation="left" />
            {chartMode === 'combo' && (
              <YAxis yAxisId="right" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} orientation="right" />
            )}
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            
            {available.map((col, i) => {
              if (!activeSeries.has(col.key)) return null;
              const color = SERIES_COLORS[i];
              const isFirstSelected = activeArray[0] === col.key;
              
              const renderAsBar = chartMode === 'bar' || (chartMode === 'combo' && isFirstSelected);
              const yAxisId = chartMode === 'combo' ? (isFirstSelected ? 'left' : 'right') : 'left';

              if (renderAsBar) {
                return (
                  <Bar
                    key={col.key}
                    yAxisId={yAxisId}
                    dataKey={col.key}
                    name={col.label}
                    fill={color}
                    opacity={0.85}
                    radius={[4, 4, 0, 0]}
                  />
                );
              }
              return (
                <Line
                  key={col.key}
                  yAxisId={yAxisId}
                  type="monotone"
                  dataKey={col.key}
                  name={col.label}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
