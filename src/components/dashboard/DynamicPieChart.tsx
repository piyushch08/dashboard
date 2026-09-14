import { useMemo, useState, useId } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { ColumnMeta } from '../../store/useDataStore';
import { PieChart as PieIcon, ChevronDown } from 'lucide-react';

interface DynamicPieChartProps {
  dataset: any[];
  numericCols: ColumnMeta[];
  catCols: ColumnMeta[];
  onSliceClick?: (col: string, val: string) => void;
}

const COLORS = ['#7B3FE4', '#A580F2', '#CBD5E1', '#C9B6F8', '#6875F5', '#8651EA', '#ec4899', '#f97316', '#14b8a6', '#475569'];

const SELECT_CLASS =
  'text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer max-w-[140px] truncate appearance-none pr-6';

export function DynamicPieChart({ dataset, numericCols, catCols, onSliceClick }: DynamicPieChartProps) {
  const [catKey, setCatKey] = useState(catCols[0]?.key ?? '');
  const [numKey, setNumKey] = useState(numericCols[0]?.key ?? '');
  const catId = useId();
  const numId = useId();

  const activeCat = catCols.find(c => c.key === catKey);
  const activeNum = numericCols.find(c => c.key === numKey);

  const pieData = useMemo(() => {
    if (!activeCat || !activeNum || dataset.length === 0) return [];

    const map = new Map<string, number>();
    for (const row of dataset) {
      const c = String(row[activeCat.key] || 'Unknown').trim();
      const n = Number(row[activeNum.key]);
      if (!isNaN(n)) {
        map.set(c, (map.get(c) || 0) + n);
      }
    }

    const arr = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Group tail into "Other" if > 10
    if (arr.length > 10) {
      const top9 = arr.slice(0, 9);
      const tail = arr.slice(9);
      const tailSum = tail.reduce((a, b) => a + b.value, 0);
      top9.push({ name: 'Other', value: tailSum });
      return top9;
    }

    return arr;
  }, [dataset, activeCat, activeNum]);

  if (catCols.length === 0 || numericCols.length === 0) return null;

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
    return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
  };

  return (
    <section className="card p-5 flex flex-col h-[400px]" aria-label="Proportional Distribution Chart">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10" aria-hidden="true">
            <PieIcon size={14} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 truncate">
            Distribution
          </h3>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <label htmlFor={catId} className="sr-only">Category</label>
            <select
              id={catId}
              value={catKey}
              onChange={e => setCatKey(e.target.value)}
              className={SELECT_CLASS}
            >
              {catCols.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          <div className="relative">
            <label htmlFor={numId} className="sr-only">Value</label>
            <select
              id={numId}
              value={numKey}
              onChange={e => setNumKey(e.target.value)}
              className={SELECT_CLASS}
            >
              {numericCols.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
              onClick={(e: any) => {
                if (e && e.name !== 'Other' && onSliceClick) {
                  onSliceClick(catKey, e.name);
                }
              }}
              style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
            >
              {pieData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => fmt(Number(value))}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
