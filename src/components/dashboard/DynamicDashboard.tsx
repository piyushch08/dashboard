import { useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { KpiCard } from './KpiCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { motion } from 'motion/react';
import { Database, Hash, Trash2 } from 'lucide-react';

const COLORS = ['#00F0FF', '#9D00FF', '#FF007F', '#10b981', '#f59e0b', '#3b82f6'];

export function DynamicDashboard() {
  const { dataset, columns, clearData } = useDataStore();

  const numericCols = columns.filter(c => c.type === 'number');
  const catCols = columns.filter(c => c.type === 'string' || c.type === 'date');
  
  // Use first categorical col for X axis, or fallback to an index
  const xAxisCol = catCols.length > 0 ? catCols[0].key : (numericCols.length > 0 ? numericCols[0].key : '');
  
  // Calculate top-level KPIs (Sums of the first 4 numeric columns)
  const kpis = useMemo(() => {
    return numericCols.slice(0, 4).map((col, idx) => {
      const total = dataset.reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0);
      const color = COLORS[idx % COLORS.length];
      return {
        title: col.label,
        value: total > 1000 ? (total / 1000).toFixed(1) + 'k' : total.toLocaleString(),
        change: Math.floor(Math.random() * 20) - 10, // Simulated change
        color
      };
    });
  }, [dataset, numericCols]);

  if (dataset.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Insights</h1>
          <p className="text-slate-400 mt-1">Generated from {dataset.length} records</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <button 
            onClick={clearData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <Trash2 size={16} />
            Clear Data
          </button>
        </motion.div>
      </div>

      {/* KPI Grid */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <KpiCard 
              key={i}
              title={kpi.title} 
              value={kpi.value.toString()} 
              change={kpi.change} 
              icon={Hash} 
              iconColorClass=""
              delay={0.1 * i}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Bar Chart */}
        {numericCols.length > 0 && xAxisCol && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Database size={18} className="text-neon-cyan" />
              <h3 className="text-lg font-bold text-white">Bar Analysis: {numericCols[0].label}</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataset.slice(0, 20)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey={numericCols[0].key} fill="#00F0FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Dynamic Line Chart */}
        {numericCols.length > 1 && xAxisCol && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Database size={18} className="text-neon-purple" />
              <h3 className="text-lg font-bold text-white">Trend: {numericCols[1].label}</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataset.slice(0, 20)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey={numericCols[1].key} stroke="#9D00FF" strokeWidth={3} dot={{ r: 4, fill: '#9D00FF' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
