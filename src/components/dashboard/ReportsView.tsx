import { useDataStore } from '../../store/useDataStore';
import { Download, FileSpreadsheet, FileText, Check, FileBarChart2, Info, AlertTriangle, TrendingUp, GitBranch } from 'lucide-react';
import { useState, useId, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import { generateInsights } from '../../utils/statistics';

interface ExportCardProps {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  activeIcon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
  bgClass: string;
}

const TYPE_ICON = {
  outlier: AlertTriangle,
  skew: TrendingUp,
  correlation: GitBranch,
  summary: Info,
} as const;

const SEVERITY_STYLE = {
  critical: {
    wrapper: 'bg-red-50 border-red-200',
    icon: 'text-danger',
    title: 'text-red-800',
    body: 'text-red-600',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200',
    icon: 'text-warning',
    title: 'text-amber-800',
    body: 'text-amber-600',
  },
  info: {
    wrapper: 'bg-primary-light border-primary-border',
    icon: 'text-primary',
    title: 'text-indigo-800',
    body: 'text-indigo-600',
  },
} as const;

function ExportCard({ label, description, icon: Icon, activeIcon: ActiveIcon, isActive, onClick, colorClass, bgClass }: ExportCardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label}${isActive ? ' — downloaded successfully' : ''}`}
      className="card p-5 flex flex-col items-center gap-3 hover:border-primary/30 transition-all cursor-pointer text-center group w-full"
    >
      <div className={`p-3 rounded-xl transition-colors duration-200 ${isActive ? 'bg-success-light' : `${bgClass} group-hover:${colorClass.replace('text-', 'bg-').replace('/80', '/15')}`}`}>
        {isActive
          ? <ActiveIcon size={24} className="text-success" aria-hidden="true" />
          : <Icon size={24} className={`${colorClass} transition-colors`} aria-hidden="true" />
        }
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
      {isActive && (
        <span role="status" className="sr-only">
          {label} downloaded successfully
        </span>
      )}
    </button>
  );
}

export function ReportsView() {
  const { dataset, columns } = useDataStore();
  const [exported, setExported] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const tableId = useId();

  const exportCSV = () => {
    const headers = columns.map(c => c.label).join(',');
    const rows = dataset.map(row => columns.map(c => {
      const val = String(row[c.key] ?? '');
      return val.includes(',') ? `"${val}"` : val;
    }).join(','));
    const csv = [headers, ...rows].join('\n');
    downloadFile(csv, 'data-export.csv', 'text/csv');
    flash('csv');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataset);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'data-export.xlsx');
    flash('xlsx');
  };

  const exportJSON = () => {
    const json = JSON.stringify(dataset, null, 2);
    downloadFile(json, 'data-export.json', 'application/json');
    flash('json');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const flash = (id: string) => {
    setExported(id);
    setTimeout(() => setExported(null), 2500);
  };

  const {
    numericSummary,
    categoricalSummary,
    overallCompleteness,
    insights
  } = useMemo(() => {
    if (dataset.length === 0) {
      return { numericSummary: [], categoricalSummary: [], overallCompleteness: 0, insights: [] };
    }

    let totalCells = dataset.length * columns.length;
    let missingCells = 0;

    const numericCols = columns.filter(c => c.type === 'number');
    const catCols = columns.filter(c => c.type !== 'number');

    const numSummary = numericCols.map(col => {
      const values = dataset.map(r => r[col.key]);
      const missing = values.filter(v => v == null || v === '').length;
      missingCells += missing;

      const nums = values.map(Number).filter(n => !isNaN(n));
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = nums.length > 0 ? (sum / nums.length) : 0;
      
      const sorted = [...nums].sort((a,b) => a - b);
      const median = sorted.length > 0
        ? sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
        : 0;

      const min = nums.length > 0 ? sorted[0] : 0;
      const max = nums.length > 0 ? sorted[sorted.length - 1] : 0;
      const variance = nums.length > 0 ? nums.reduce((s, n) => s + (n - mean)**2, 0) / nums.length : 0;
      const stdDev = Math.sqrt(variance);

      return {
        label: col.label,
        missing: `${missing} (${((missing / dataset.length) * 100).toFixed(1)}%)`,
        sum: sum.toLocaleString(),
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        min: min.toLocaleString(),
        max: max.toLocaleString(),
        stdDev: stdDev.toFixed(2)
      };
    });

    const catSummary = catCols.map(col => {
      const values = dataset.map(r => r[col.key]);
      const missing = values.filter(v => v == null || v === '').length;
      missingCells += missing;

      const validValues = values.filter(v => v != null && v === String(v) && v.trim() !== '');
      const uniqueCount = new Set(validValues).size;
      
      const freq: Record<string, number> = {};
      validValues.forEach(v => {
        const str = String(v);
        freq[str] = (freq[str] || 0) + 1;
      });
      const top = Object.entries(freq).sort((a,b) => b[1] - a[1])[0];
      const topValue = top ? `${top[0]} (${top[1]})` : '—';

      return {
        label: col.label,
        missing: `${missing} (${((missing / dataset.length) * 100).toFixed(1)}%)`,
        unique: uniqueCount.toLocaleString(),
        topValue
      };
    });

    const overallCompleteness = totalCells > 0 ? ((totalCells - missingCells) / totalCells) * 100 : 100;
    const computedInsights = generateInsights(dataset, numericCols);

    return { numericSummary: numSummary, categoricalSummary: catSummary, overallCompleteness, insights: computedInsights };
  }, [dataset, columns]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-600 mt-0.5">Export your data or view a summary report</p>
      </div>

      {/* Export cards */}
      <section aria-label="Export options">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ExportCard
            id="csv"
            label="Export CSV"
            description="Comma-separated values"
            icon={FileText}
            activeIcon={Check}
            isActive={exported === 'csv'}
            onClick={exportCSV}
            colorClass="text-primary/80"
            bgClass="bg-primary-light"
          />
          <ExportCard
            id="xlsx"
            label="Export Excel"
            description=".xlsx spreadsheet"
            icon={FileSpreadsheet}
            activeIcon={Check}
            isActive={exported === 'xlsx'}
            onClick={exportExcel}
            colorClass="text-success"
            bgClass="bg-success-light"
          />
          <ExportCard
            id="json"
            label="Export JSON"
            description="Raw JSON format"
            icon={Download}
            activeIcon={Check}
            isActive={exported === 'json'}
            onClick={exportJSON}
            colorClass="text-accent"
            bgClass="bg-accent-light"
          />
        </div>
      </section>

      {/* Overall Report Status & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section aria-label="Dataset status" className="lg:col-span-1">
          <div className="card p-5 h-full flex flex-col gap-4 bg-gradient-to-br from-[#f3f0ff] to-white">
            <div className="flex items-center gap-2">
              <FileBarChart2 size={16} className="text-[#7B3FE4]" />
              <h2 className="text-sm font-semibold text-slate-800">Dataset Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">Total Records</p>
                <p className="text-2xl font-bold text-slate-600 mt-1">{dataset.length.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">Columns</p>
                <p className="text-2xl font-bold text-slate-600 mt-1">{columns.length}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">Data Completeness</p>
                  <span className="text-sm font-bold text-slate-600">{overallCompleteness.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7B3FE4] to-accent transition-all duration-1000"
                    style={{ width: `${overallCompleteness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Executive Summary" className="lg:col-span-2">
          <div className="card p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-[#7B3FE4]" />
              <h2 className="text-sm font-semibold text-slate-800">Executive Summary</h2>
            </div>
            {insights.length === 0 ? (
              <p className="text-sm text-slate-600">Not enough numeric data to generate insights.</p>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 max-h-[300px]">
                {insights.map((insight, idx) => {
                  const IconComponent = TYPE_ICON[insight.type] ?? Info;
                  const style = SEVERITY_STYLE[insight.severity];
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 p-3.5 rounded-xl border ${style.wrapper} transition-all hover:shadow-sm`}
                    >
                      <IconComponent
                        size={16}
                        className={`flex-shrink-0 mt-0.5 ${style.icon}`}
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-snug ${style.title}`}>
                          {insight.title}
                        </p>
                        <p className={`text-xs mt-1 leading-relaxed ${style.body} opacity-80`}>
                          {insight.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between mt-2">
        <h2 className="text-lg font-semibold text-slate-800">Detailed Attributes Breakdown</h2>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm font-medium text-[#7B3FE4] hover:text-[#6c32d4] transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDetails && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-6"
        >
          {/* Numeric Columns Details */}
          {numericSummary.length > 0 && (
            <section aria-label="Numeric Report">
              <div className="card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Numeric Attributes</h3>
                  <span className="text-xs text-slate-600">{numericSummary.length} columns</span>
                </div>
            <div className="overflow-x-auto">
              <table id={tableId} className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Column</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Missing</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Sum</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Mean</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Median</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Min</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Max</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Std Dev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {numericSummary.map(s => (
                    <tr key={s.label} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-600">{s.label}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.missing}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.sum}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.mean}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.median}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.min}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.max}</td>
                      <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.stdDev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Categorical Columns Details */}
          {categoricalSummary.length > 0 && (
            <section aria-label="Categorical Report">
              <div className="card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Categorical Attributes</h3>
                  <span className="text-xs text-slate-600">{categoricalSummary.length} columns</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-white">
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Column</th>
                        <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Missing</th>
                        <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Unique Count</th>
                        <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Top Value (Freq)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categoricalSummary.map(s => (
                        <tr key={s.label} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-600">{s.label}</td>
                          <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.missing}</td>
                          <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{s.unique}</td>
                          <td className="px-5 py-3 text-right text-slate-600 truncate max-w-[200px]">{s.topValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
