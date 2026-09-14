import { useMemo, useId, useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { Hash, Type, Calendar, LayoutGrid, Grid3x3 } from 'lucide-react';
import { CorrelationHeatmap } from './CorrelationHeatmap';

// Color-coded type badge config
const TYPE_CONFIG = {
  number: {
    icon: Hash,
    label: 'Numeric',
    className: 'bg-primary-light text-primary border-primary-border',
    iconClass: 'text-primary',
  },
  date: {
    icon: Calendar,
    label: 'Date',
    className: 'bg-warning-light text-warning border-yellow-200',
    iconClass: 'text-warning',
  },
  string: {
    icon: Type,
    label: 'Text',
    className: 'bg-slate-100 text-slate-600 border-gray-200',
    iconClass: 'text-slate-500',
  },
} as const;

type AnalyticsTab = 'stats' | 'heatmap';

export function AnalyticsView() {
  const { dataset, columns, searchQuery } = useDataStore();
  const sectionId = useId();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('stats');
  const numericCols = columns.filter(c => c.type === 'number');

  const filteredData = useMemo(() => {
    if (!searchQuery) return dataset;
    const q = searchQuery.toLowerCase();
    return dataset.filter(row =>
      Object.values(row).some(val => String(val).toLowerCase().includes(q))
    );
  }, [dataset, searchQuery]);

  const stats = useMemo(() => {
    return columns.map(col => {
      const values = filteredData.map(r => r[col.key]);
      const uniqueCount = new Set(values.filter(v => v !== null && v !== undefined && v !== '')).size;
      const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
      const total = values.length;

      if (col.type === 'number') {
        const nums = values.map(Number).filter(n => !isNaN(n));
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = nums.length > 0 ? sum / nums.length : 0;
        const sorted = [...nums].sort((a, b) => a - b);
        const median = sorted.length > 0
          ? sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)]
          : 0;
        const min = sorted.length > 0 ? sorted[0] : 0;
        const max = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
        const variance = nums.length > 0 ? nums.reduce((s, n) => s + Math.pow(n - mean, 2), 0) / nums.length : 0;
        const stdDev = Math.sqrt(variance);

        return { col, uniqueCount, nullCount, total, type: 'number' as const, sum, mean, median, min, max, stdDev };
      }

      const topValues = Object.entries(
        values.reduce((acc: Record<string, number>, v) => {
          const key = String(v ?? '');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 3);

      return { col, uniqueCount, nullCount, total, type: 'string' as const, topValues };
    });
  }, [columns, filteredData]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header + view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-slate-600 mt-0.5" aria-live="polite">
            Column-level statistics for {filteredData.length.toLocaleString()} records
          </p>
        </div>

        {/* View switcher */}
        <div
          className="flex items-center bg-slate-100 border border-gray-200 rounded-lg p-0.5 gap-0.5 ml-auto"
          role="group"
          aria-label="Analytics view"
        >
          <button
            onClick={() => setActiveTab('stats')}
            aria-pressed={activeTab === 'stats'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-gray-700'
            }`}
          >
            <LayoutGrid size={12} aria-hidden="true" />
            Stats
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            disabled={numericCols.length < 2}
            aria-pressed={activeTab === 'heatmap'}
            aria-disabled={numericCols.length < 2}
            title={numericCols.length < 2 ? 'Need at least 2 numeric columns' : 'Correlation heatmap'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'heatmap' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-gray-700'
            }`}
          >
            <Grid3x3 size={12} aria-hidden="true" />
            Heatmap
          </button>
        </div>
      </div>

      {/* Heatmap view */}
      {activeTab === 'heatmap' && (
        <CorrelationHeatmap dataset={filteredData} numericCols={numericCols} />
      )}

      {/* Stats cards view */}
      {activeTab === 'stats' && (
      <section aria-labelledby={sectionId}>
        <h2 id={sectionId} className="sr-only">Column statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((s) => {
            const cfg = TYPE_CONFIG[s.col.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.string;
            const TypeIcon = cfg.icon;
            const fillPct = s.total > 0 ? Math.round(((s.total - s.nullCount) / s.total) * 100) : 100;

            return (
              <article
                key={s.col.key}
                className="card p-5"
                aria-label={`${s.col.label} — ${cfg.label} column`}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-4">
                  <TypeIcon size={14} className={cfg.iconClass} aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{s.col.label}</h3>
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Completeness bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Completeness</span>
                    <span className="font-medium text-gray-600">{fillPct}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={fillPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${s.col.label} completeness: ${fillPct}%`}
                    className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Unique</span>
                    <span className="font-medium text-gray-900">{s.uniqueCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Missing</span>
                    <span className={`font-medium ${s.nullCount > 0 ? 'text-warning' : 'text-gray-900'}`}>
                      {s.nullCount}
                    </span>
                  </div>

                  {s.type === 'number' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Mean</span>
                        <span className="font-medium text-gray-900">{s.mean.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Median</span>
                        <span className="font-medium text-gray-900">{s.median.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Min</span>
                        <span className="font-medium text-gray-900">{s.min.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Max</span>
                        <span className="font-medium text-gray-900">{s.max.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sum</span>
                        <span className="font-medium text-gray-900">{s.sum.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Std Dev</span>
                        <span className="font-medium text-gray-900">{s.stdDev.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {s.type === 'string' && (
                    <div className="col-span-2 mt-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Top Values</span>
                      <div className="mt-2 space-y-1.5">
                        {s.topValues.map(([val, count]) => {
                          const pct = s.total > 0 ? Math.round((count / s.total) * 100) : 0;
                          return (
                            <div key={val}>
                              <div className="flex items-center justify-between text-xs mb-0.5">
                                <span className="text-gray-700 truncate max-w-[60%]">{val || '(empty)'}</span>
                                <span className="text-slate-500">{count} <span className="text-gray-300">({pct}%)</span></span>
                              </div>
                              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary/50 to-accent/50 rounded-full"
                                  style={{ width: `${pct}%` }}
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      )}
    </div>
  );
}
