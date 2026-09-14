import { useMemo, useId } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { KpiCard } from './KpiCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { BarChart3, TrendingUp, Trash2, Hash } from 'lucide-react';

export function DynamicDashboard() {
  const { dataset, columns, clearData, searchQuery } = useDataStore();
  const kpiSectionId = useId();
  const barChartId = useId();
  const lineChartId = useId();

  const filteredData = useMemo(() => {
    if (!searchQuery) return dataset;
    const q = searchQuery.toLowerCase();
    return dataset.filter(row =>
      Object.values(row).some(val => String(val).toLowerCase().includes(q))
    );
  }, [dataset, searchQuery]);

  const numericCols = columns.filter(c => c.type === 'number');
  const catCols = columns.filter(c => c.type === 'string' || c.type === 'date');

  const xAxisCol = catCols.length > 0 ? catCols[0].key : (numericCols.length > 0 ? numericCols[0].key : '');

  const kpis = useMemo(() => {
    return numericCols.slice(0, 4).map((col) => {
      const total = filteredData.reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0);
      return {
        title: col.label,
        value: total > 1000 ? (total / 1000).toFixed(1) + 'k' : total.toLocaleString(),
        change: Math.floor(Math.random() * 20) - 10,
      };
    });
  }, [filteredData, numericCols]);

  if (dataset.length === 0) return null;

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.1)',
    fontSize: '12px',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Data Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5" aria-live="polite">
            {filteredData.length} records{searchQuery ? ' (filtered)' : ''}
          </p>
        </div>

        <button
          onClick={clearData}
          aria-label="Clear all data and return to upload screen"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-light transition-colors border border-red-200"
        >
          <Trash2 size={14} aria-hidden="true" />
          Clear Data
        </button>
      </div>

      {/* KPI Grid */}
      {kpis.length > 0 && (
        <section aria-labelledby={kpiSectionId}>
          <h2 id={kpiSectionId} className="sr-only">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <KpiCard
                key={i}
                title={kpi.title}
                value={kpi.value.toString()}
                change={kpi.change}
                icon={Hash}
                iconColorClass="text-primary"
              />
            ))}
          </div>
        </section>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        {numericCols.length > 0 && xAxisCol && (
          <section
            aria-labelledby={barChartId}
            className="chart-container card p-5 flex flex-col h-[380px]"
            tabIndex={0}
            aria-label={`Bar chart showing ${numericCols[0].label} values`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10" aria-hidden="true">
                <BarChart3 size={15} className="text-primary" />
              </div>
              <h3 id={barChartId} className="text-sm font-semibold text-gray-900">
                {numericCols[0].label} — Bar Chart
              </h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData.slice(0, 20)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
                <Bar dataKey={numericCols[0].key} fill="#4f46e5" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Line Chart */}
        {numericCols.length > 1 && xAxisCol && (
          <section
            aria-labelledby={lineChartId}
            className="chart-container card p-5 flex flex-col h-[380px]"
            tabIndex={0}
            aria-label={`Line chart showing ${numericCols[1].label} trend`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-accent/10" aria-hidden="true">
                <TrendingUp size={15} className="text-accent" />
              </div>
              <h3 id={lineChartId} className="text-sm font-semibold text-gray-900">
                {numericCols[1].label} — Trend
              </h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataset.slice(0, 20)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey={numericCols[1].key} stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3.5, fill: '#7c3aed', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}
      </div>
    </div>
  );
}
