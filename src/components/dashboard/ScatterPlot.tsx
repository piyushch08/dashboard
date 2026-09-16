import { useState, useMemo, useId } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts';
import type { ColumnMeta } from '../../store/useDataStore';
import { pearsonCorrelation, linearRegression } from '../../utils/statistics';
import { GitBranch } from 'lucide-react';

interface ScatterPlotProps {
  dataset: any[];
  numericCols: ColumnMeta[];
}

const SELECT_CLASS =
  'text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer max-w-[120px] truncate';

const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

export function ScatterPlot({ dataset, numericCols }: ScatterPlotProps) {
  const [xColKey, setXColKey] = useState(numericCols[0]?.key ?? '');
  const [yColKey, setYColKey] = useState(numericCols[1]?.key ?? numericCols[0]?.key ?? '');
  const xId = useId();
  const yId = useId();

  const xCol = numericCols.find(c => c.key === xColKey);
  const yCol = numericCols.find(c => c.key === yColKey);

  const { scatterData, trendPoints, correlation } = useMemo(() => {
    if (!xCol || !yCol) return { scatterData: [], trendPoints: [], correlation: 0 };

    const validRows = dataset.filter(
      row =>
        row[xColKey] != null &&
        row[yColKey] != null &&
        !isNaN(Number(row[xColKey])) &&
        !isNaN(Number(row[yColKey]))
    );

    // Cap at 300 points for performance
    const sample = validRows.slice(0, 300);
    const scatterData = sample.map(row => ({
      x: Number(row[xColKey]),
      y: Number(row[yColKey]),
    }));

    const xs = scatterData.map(d => d.x);
    const ys = scatterData.map(d => d.y);

    const correlation = pearsonCorrelation(xs, ys);
    const { slope, intercept } = linearRegression(xs, ys);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const trendPoints =
      xs.length >= 2
        ? [
            { x: minX, y: slope * minX + intercept },
            { x: maxX, y: slope * maxX + intercept },
          ]
        : [];

    return { scatterData, trendPoints, correlation };
  }, [dataset, xColKey, yColKey, xCol, yCol]);

  if (numericCols.length < 2) {
    return (
      <div className="card p-5 flex items-center justify-center h-[380px]">
        <p className="text-sm text-slate-500 text-center">
          Need at least 2 numeric columns for scatter plot.
        </p>
      </div>
    );
  }

  const absR = Math.abs(correlation);
  const corrStrength = absR >= 0.7 ? 'Strong' : absR >= 0.4 ? 'Moderate' : 'Weak';
  const corrDir = correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : '';
  const corrColor =
    absR >= 0.7
      ? correlation > 0
        ? '#059669'
        : '#dc2626'
      : '#d97706';

  return (
    <section
      className="chart-container card p-5 flex flex-col h-[380px]"
      aria-label={`Scatter plot: ${xCol?.label ?? ''} vs ${yCol?.label ?? ''}. Correlation r = ${correlation.toFixed(3)}.`}
      tabIndex={0}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10" aria-hidden="true">
            <GitBranch size={14} className="text-accent" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Scatter Plot</h3>
        </div>

        {/* Correlation badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
          style={{
            color: corrColor,
            borderColor: corrColor + '50',
            backgroundColor: corrColor + '14',
          }}
          aria-label={`${corrStrength} ${corrDir} correlation: r = ${correlation.toFixed(3)}`}
        >
          <span>r = {correlation.toFixed(3)}</span>
          <span style={{ opacity: 0.6 }}>({corrStrength})</span>
        </div>
      </div>

      {/* Axis pickers */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <label htmlFor={xId} className="text-xs text-slate-500 font-medium">X:</label>
        <select
          id={xId}
          value={xColKey}
          onChange={e => setXColKey(e.target.value)}
          className={SELECT_CLASS}
          aria-label="X axis column"
        >
          {numericCols.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <label htmlFor={yId} className="text-xs text-slate-500 font-medium">Y:</label>
        <select
          id={yId}
          value={yColKey}
          onChange={e => setYColKey(e.target.value)}
          className={SELECT_CLASS}
          aria-label="Y axis column"
        >
          {numericCols.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-500">{scatterData.length} pts</span>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              type="number"
              dataKey="x"
              name={xCol?.label}
              stroke="#475569"
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yCol?.label}
              stroke="#475569"
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis range={[30, 30]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
              contentStyle={TOOLTIP_STYLE}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const { x, y } = payload[0].payload as { x: number; y: number };
                return (
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs">
                    <p className="text-slate-600 mb-0.5">
                      {xCol?.label}:{' '}
                      <span className="font-bold text-slate-800">{x.toLocaleString()}</span>
                    </p>
                    <p className="text-slate-600">
                      {yCol?.label}:{' '}
                      <span className="font-bold text-slate-800">{y.toLocaleString()}</span>
                    </p>
                  </div>
                );
              }}
            />

            {/* Data scatter */}
            <Scatter
              name="Data"
              data={scatterData}
              fill="#8b5cf6"
              isAnimationActive={true}
              animationDuration={400} animationBegin={0}
              animationEasing="ease-out"
              fillOpacity={0.65}
            />

            {/* Regression trend line — rendered as a 2-point Scatter with line prop */}
            {trendPoints.length === 2 && (
              <Scatter
                name="Trend"
                data={trendPoints}
                fill="none"
                line={{ stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5 4' }}
                shape={(props: any) => (
                  <circle cx={props.cx} cy={props.cy} r={0} fill="none" />
                )}
                legendType="none"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend row */}
      <div className="flex items-center gap-4 mt-2 flex-shrink-0 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-65" aria-hidden="true" />
          <span>Data points</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-0.5"
            style={{ background: 'repeating-linear-gradient(to right, #dc2626 0, #dc2626 5px, transparent 5px, transparent 9px)' }}
            aria-hidden="true"
          />
          <span>Trend line</span>
        </div>
      </div>
    </section>
  );
}
