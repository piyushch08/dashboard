import { useMemo, useState, useId, useDeferredValue } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { KpiCard } from './KpiCard';
import { ScatterPlot } from './ScatterPlot';
import { Histogram } from './Histogram';
import { InsightsPanel } from './InsightsPanel';
import { MultiSeriesChart } from './MultiSeriesChart';
import { BoxPlotSummary } from './BoxPlotSummary';
import { DynamicPieChart } from './DynamicPieChart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Brush, Cell,
} from 'recharts';
import { 
  BarChart3, TrendingUp, Activity, Trash2, Hash, X as XIcon, ZoomIn, 
  ChevronDown, Database, Columns, CheckCircle2 
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartType = 'bar' | 'line' | 'area';

interface ActiveFilter {
  column: string;
  label: string;
  value: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CHART_TABS: { type: ChartType; label: string; Icon: React.ElementType }[] = [
  { type: 'bar',  label: 'Bar',  Icon: BarChart3 },
  { type: 'line', label: 'Line', Icon: TrendingUp },
  { type: 'area', label: 'Area', Icon: Activity },
];

const BAR_COLORS = ['#7B3FE4', '#A580F2', '#CBD5E1', '#C9B6F8', '#6875F5', '#8651EA'];
const ACTIVE_COLOR = '#7B3FE4';

const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

const AXIS_PROPS = {
  stroke: '#94a3b8',
  fontSize: 11,
  axisLine: false as const,
  tickLine: false as const,
};

const SELECT_CLASS =
  'text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer max-w-[140px] truncate ' +
  'appearance-none pr-6 bg-no-repeat';

// ─── Component ───────────────────────────────────────────────────────────────

export function DynamicDashboard() {
  const { dataset, columns, clearData, searchQuery } = useDataStore();

  const [chartType, setChartType]     = useState<ChartType>('bar');
  const [xColKey, setXColKey]         = useState('');
  const [yColKey, setYColKey]         = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null);

  const kpiId        = useId();
  const mainChartId  = useId();

  // ─── Derived column lists ────────────────────────────────────────────────
  const numericCols = columns.filter(c => c.type === 'number');
  const catCols     = columns.filter(c => c.type === 'string' || c.type === 'date');
  const allXCols    = [...catCols, ...numericCols];

  // Resolve selected columns (fall back to first available)
  const resolvedXKey = xColKey || allXCols[0]?.key  || '';
  const resolvedYKey = yColKey || numericCols[0]?.key || '';

  const resolvedXLabel = columns.find(c => c.key === resolvedXKey)?.label ?? resolvedXKey;
  const resolvedYLabel = numericCols.find(c => c.key === resolvedYKey)?.label ?? resolvedYKey;

  // ─── Filtering ──────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = dataset;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(q))
      );
    }

    if (activeFilter) {
      data = data.filter(
        row => String(row[activeFilter.column]) === activeFilter.value
      );
    }

    return data;
  }, [dataset, searchQuery, activeFilter]);

  // Use deferred value for heavy chart rendering to keep UI snappy
  const deferredFilteredData = useDeferredValue(filteredData);
  const isPending = filteredData !== deferredFilteredData;

  // ─── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    return numericCols.slice(0, 4).map(col => {
      const filtVals = deferredFilteredData.map(r => Number(r[col.key])).filter(n => !isNaN(n));
      const allVals  = dataset.map(r => Number(r[col.key])).filter(n => !isNaN(n));

      const filtTotal = filtVals.reduce((a, b) => a + b, 0);
      const allMean   = allVals.length > 0 ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0;
      const filtMean  = filtVals.length > 0 ? filtTotal / filtVals.length : 0;
      const change    = allMean > 0 ? Math.round(((filtMean - allMean) / allMean) * 100) : 0;

      const fmt = (n: number) =>
        n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000   ? `${(n / 1_000).toFixed(1)}k`
        : n.toLocaleString();

      const step = Math.max(1, Math.floor(filtVals.length / 10));
      const sparkData = filtVals.filter((_, i) => i % step === 0).slice(0, 10);

      return { title: col.label, value: fmt(filtTotal), change, sparkData };
    });
  }, [deferredFilteredData, numericCols, dataset]);

  // ─── Dataset Metadata ────────────────────────────────────────────────────
  const completeness = useMemo(() => {
    if (dataset.length === 0) return 100;
    const totalCells = dataset.length * columns.length;
    let missing = 0;
    dataset.forEach(row => {
      columns.forEach(col => {
        const val = row[col.key];
        if (val == null || val === '') missing++;
      });
    });
    return ((totalCells - missing) / totalCells) * 100;
  }, [dataset, columns]);

  if (dataset.length === 0) return null;

  const chartData = deferredFilteredData.slice(0, 40);
  const isFiltered = !!(activeFilter || searchQuery);

  // ─── Click-to-filter handler (bar chart) ─────────────────────────────────
  const handleBarClick = (barData: any) => {
    if (!barData) return;
    const clickedVal = String(barData[resolvedXKey]);
    if (activeFilter?.value === clickedVal && activeFilter.column === resolvedXKey) {
      setActiveFilter(null); // Toggle off
    } else {
      setActiveFilter({
        column: resolvedXKey,
        label: resolvedXLabel,
        value: clickedVal,
      });
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const barColor = (entry: any) => {
    if (!activeFilter) return BAR_COLORS[0];
    return String(entry[resolvedXKey]) === activeFilter.value ? ACTIVE_COLOR : BAR_COLORS[0];
  };

  const barOpacity = (entry: any) => {
    if (!activeFilter) return 1;
    return String(entry[resolvedXKey]) === activeFilter.value ? 1 : 0.3;
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Data Insights</h1>
            <p className="text-sm text-slate-600 mt-0.5" aria-live="polite">
              {filteredData.length.toLocaleString()} records{isFiltered ? ' (filtered)' : ''}
            </p>
          </div>
          {isPending && (
            <span className="text-xs font-semibold text-primary/70 animate-pulse bg-primary/10 px-2 py-1 rounded-md">
              Calculating...
            </span>
          )}
        </div>
        <button
          onClick={clearData}
          aria-label="Clear all data and return to upload"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-light transition-colors border border-red-200"
        >
          <Trash2 size={14} aria-hidden="true" />
          Clear Data
        </button>
      </div>

      {/* ── Active filter badge ── */}
      {activeFilter && (
        <div
          className="flex items-center gap-2 flex-wrap"
          role="status"
          aria-label={`Active filter: ${activeFilter.label} equals ${activeFilter.value}`}
        >
          <span className="text-xs text-slate-600 font-medium">Filtered by:</span>
          <div className="flex items-center gap-1.5 bg-primary-light border border-primary-border rounded-full px-3 py-1">
            <span className="text-xs text-primary/70">{activeFilter.label}</span>
            <span className="text-xs text-primary">=</span>
            <span className="text-xs font-bold text-primary">{activeFilter.value}</span>
            <button
              onClick={() => setActiveFilter(null)}
              aria-label="Remove filter"
              className="ml-1 text-primary/60 hover:text-danger transition-colors"
            >
              <XIcon size={11} aria-hidden="true" />
            </button>
          </div>
          <span className="text-xs text-slate-500">
            {filteredData.length.toLocaleString()} of {dataset.length.toLocaleString()} records
          </span>
        </div>
      )}

      {/* ── KPI Grid ── */}
      {kpis.length > 0 && (
        <section aria-labelledby={kpiId}>
          <h2 id={kpiId} className="sr-only">Key Performance Indicators</h2>
          
          {/* High-level dataset metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="card flex items-center justify-between group hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs text-slate-600 font-bold mb-1">Total Records</p>
                <p className="text-2xl font-bold text-[#7B3FE4]">{dataset.length.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#f3f0ff] flex items-center justify-center">
                <Database size={24} className="text-[#7B3FE4]" />
              </div>
            </div>
            <div className="card flex items-center justify-between group hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs text-slate-600 font-bold mb-1">Total Columns</p>
                <p className="text-2xl font-bold text-[#7B3FE4]">{columns.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#f3f0ff] flex items-center justify-center">
                <Columns size={24} className="text-[#7B3FE4]" />
              </div>
            </div>
            <div className="card flex items-center justify-between group hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs text-slate-600 font-bold mb-1">Data Health</p>
                <p className="text-2xl font-bold text-[#7B3FE4]">{completeness.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#f3f0ff] flex items-center justify-center">
                <CheckCircle2 size={24} className="text-[#7B3FE4]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <KpiCard
                key={i}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                sparkData={kpi.sparkData}
                icon={Hash}
                iconColorClass="text-primary"
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Main chart section ── */}
      {numericCols.length > 0 && resolvedXKey && resolvedYKey && (
        <section aria-labelledby={mainChartId}>
          <h2 id={mainChartId} className="sr-only">Interactive Charts</h2>

          {/* Chart controls toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-gray-100">

            {/* Type switcher pill */}
            <div
              className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5 shadow-sm"
              role="group"
              aria-label="Chart type"
            >
              {CHART_TABS.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  aria-pressed={chartType === type}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                    chartType === type
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-gray-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={12} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            {/* Axis pickers */}
            <div className="flex items-center gap-1.5 relative">
              <span className="text-xs text-slate-600 font-semibold">X:</span>
              <div className="relative">
                <select
                  value={resolvedXKey}
                  onChange={e => { setXColKey(e.target.value); setActiveFilter(null); }}
                  className={SELECT_CLASS}
                  aria-label="X axis column"
                >
                  {allXCols.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-semibold">Y:</span>
              <div className="relative">
                <select
                  value={resolvedYKey}
                  onChange={e => setYColKey(e.target.value)}
                  className={SELECT_CLASS}
                  aria-label="Y axis column"
                >
                  {numericCols.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Contextual hint */}
            <div className="ml-auto text-xs text-slate-500 flex items-center gap-1.5">
              {chartType === 'bar' ? (
                <><BarChart3 size={11} aria-hidden="true" /><span>Click a bar to filter all charts</span></>
              ) : (
                <><ZoomIn size={11} aria-hidden="true" /><span>Drag the brush below to zoom</span></>
              )}
            </div>
          </div>

          {/* Charts row — main chart (3/5) + scatter (2/5) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* ── Switchable main chart ── */}
            <div
              className="chart-container card p-5 flex flex-col h-[380px] lg:col-span-3"
              tabIndex={0}
              aria-label={`${chartType} chart: ${resolvedYLabel} by ${resolvedXLabel}`}
            >
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <div className="p-1.5 rounded-lg bg-primary/10" aria-hidden="true">
                  <BarChart3 size={15} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {resolvedYLabel} by {resolvedXLabel}
                </h3>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 5, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey={resolvedXKey} {...AXIS_PROPS} />
                    <YAxis {...AXIS_PROPS} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar
                      dataKey={resolvedYKey}
                      radius={[5, 5, 0, 0]}
                      onClick={handleBarClick}
                      style={{ cursor: 'pointer' }}
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    >
                      {chartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={barColor(entry)}
                          opacity={barOpacity(entry)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart
                    data={chartData}
                    margin={{ top: 4, right: 5, left: -20, bottom: 28 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey={resolvedXKey} {...AXIS_PROPS} />
                    <YAxis {...AXIS_PROPS} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Brush
                      dataKey={resolvedXKey}
                      height={22}
                      stroke="#e2e8f0"
                      fill="#f8fafc"
                      travellerWidth={7}
                      aria-label="Zoom brush"
                    />
                    <Line
                      type="monotone"
                      dataKey={resolvedYKey}
                      stroke="#7B3FE4"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#7B3FE4', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                ) : (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 5, left: -20, bottom: 28 }}
                  >
                    <defs>
                      <linearGradient id={`areaGrad-${mainChartId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7B3FE4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#7B3FE4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey={resolvedXKey} {...AXIS_PROPS} />
                    <YAxis {...AXIS_PROPS} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Brush
                      dataKey={resolvedXKey}
                      height={22}
                      stroke="#e2e8f0"
                      fill="#f8fafc"
                      travellerWidth={7}
                      aria-label="Zoom brush"
                    />
                    <Area
                      type="monotone"
                      dataKey={resolvedYKey}
                      stroke="#7B3FE4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#areaGrad-${mainChartId})`}
                      dot={{ r: 2.5, fill: '#7B3FE4', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* ── Scatter plot ── */}
            {numericCols.length >= 2 ? (
              <div className="lg:col-span-2">
                <ScatterPlot dataset={deferredFilteredData} numericCols={numericCols} />
              </div>
            ) : (
              <div className="lg:col-span-2 card p-5 flex items-center justify-center text-slate-500 text-sm h-[380px]">
                Need ≥ 2 numeric columns for scatter plot.
              </div>
            )}
          </div>

          {/* ── Pie Chart + Histogram row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
            <div className="lg:col-span-2">
              <DynamicPieChart 
                dataset={deferredFilteredData} 
                numericCols={numericCols} 
                catCols={catCols} 
                onSliceClick={(col, val) => {
                  if (activeFilter?.value === val && activeFilter.column === col) {
                    setActiveFilter(null);
                  } else {
                    const label = columns.find(c => c.key === col)?.label || col;
                    setActiveFilter({ column: col, label, value: val });
                  }
                }}
              />
            </div>
            <div className="lg:col-span-3">
              <Histogram dataset={deferredFilteredData} numericCols={numericCols} />
            </div>
          </div>

          {/* ── Insights row ── */}
          <div className="mt-4">
            <InsightsPanel dataset={deferredFilteredData} numericCols={numericCols} />
          </div>

          {/* ── Multi-series + Box Plot row ── */}
          {numericCols.length >= 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
              <div className="lg:col-span-3">
                <MultiSeriesChart
                  dataset={deferredFilteredData}
                  xColKey={resolvedXKey}
                  numericCols={numericCols}
                />
              </div>
              <div className="lg:col-span-2">
                <BoxPlotSummary dataset={deferredFilteredData} numericCols={numericCols} />
              </div>
            </div>
          )}

          {/* ── Data Preview Table ── */}
          <div className="mt-4 card overflow-hidden mb-6">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Data Records</h3>
              <span className="text-xs text-slate-500">Showing first 10 of {filteredData.length.toLocaleString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    {columns.slice(0, 8).map(c => (
                      <th key={c.key} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {c.label}
                      </th>
                    ))}
                    {columns.length > 8 && (
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">...</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {columns.slice(0, 8).map(c => (
                        <td key={c.key} className="px-4 py-3 text-gray-600 truncate max-w-[150px]">
                          {String(row[c.key] ?? '')}
                        </td>
                      ))}
                      {columns.length > 8 && (
                        <td className="px-4 py-3 text-slate-500 italic">+{columns.length - 8} more</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      )}
    </div>
  );
}
