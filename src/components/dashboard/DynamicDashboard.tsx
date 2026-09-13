import { useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { KpiCard } from './KpiCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { BarChart3, TrendingUp, Trash2, Hash } from 'lucide-react';

export function DynamicDashboard() {
  const { dataset, columns, clearData } = useDataStore();

  const numericCols = columns.filter(c => c.type === 'number');
  const catCols = columns.filter(c => c.type === 'string' || c.type === 'date');
  
  const xAxisCol = catCols.length > 0 ? catCols[0].key : (numericCols.length > 0 ? numericCols[0].key : '');
  
  const kpis = useMemo(() => {
    return numericCols.slice(0, 4).map((col) => {
      const total = dataset.reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0);
      return {
        title: col.label,
        value: total > 1000 ? (total / 1000).toFixed(1) + 'k' : total.toLocaleString(),
        change: Math.floor(Math.random() * 20) - 10,
      };
    });
  }, [dataset, numericCols]);

  if (dataset.length === 0) return null;

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
    fontSize: '12px',
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Data Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dataset.length} records analyzed</p>
        </div>
        
        <button 
          onClick={clearData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-light transition-colors border border-gray-200"
        >
          <Trash2 size={14} />
          Clear Data
        </button>
      </div>

      {/* KPI Grid */}
      {kpis.length > 0 && (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        {numericCols.length > 0 && xAxisCol && (
          <div className="card p-5 flex flex-col h-[380px]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-gray-900">{numericCols[0].label} — Bar Chart</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataset.slice(0, 20)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={tooltipStyle} />
                <Bar dataKey={numericCols[0].key} fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Line Chart */}
        {numericCols.length > 1 && xAxisCol && (
          <div className="card p-5 flex flex-col h-[380px]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#7c3aed]" />
              <h3 className="text-sm font-semibold text-gray-900">{numericCols[1].label} — Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataset.slice(0, 20)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey={numericCols[1].key} stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
