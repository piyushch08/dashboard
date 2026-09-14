import { useDataStore } from '../../store/useDataStore';
import { Download, FileSpreadsheet, FileText, Check, FileBarChart2, Info } from 'lucide-react';
import { useState, useId, useMemo } from 'react';
import * as XLSX from 'xlsx';
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
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Export your data or view a summary report</p>
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
          <div className="card p-5 h-full flex flex-col gap-4 bg-gradient-to-br from-indigo-50/50 to-white">
            <div className="flex items-center gap-2">
              <FileBarChart2 size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-gray-900">Dataset Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{dataset.length.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Columns</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{columns.length}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Data Completeness</p>
                  <span className="text-sm font-bold text-gray-900">{overallCompleteness.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
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
              <Info size={16} className="text-accent" />
              <h2 className="text-sm font-semibold text-gray-900">Executive Summary</h2>
            </div>
            {insights.length === 0 ? (
              <p className="text-sm text-gray-500">Not enough numeric data to generate insights.</p>
            ) : (
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                {insights.map((insight, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <strong className="text-gray-900 font-semibold">{insight.title}:</strong> {insight.body}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Numeric Columns Details */}
      {numericSummary.length > 0 && (
        <section aria-label="Numeric Report">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Numeric Attributes</h3>
              <span className="text-xs text-gray-400">{numericSummary.length} columns</span>
            </div>
            <div className="overflow-x-auto">
              <table id={tableId} className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Column</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Missing</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Sum</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Mean</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Median</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Min</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Max</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Std Dev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {numericSummary.map(s => (
                    <tr key={s.label} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{s.label}</td>
                      <td className="px-5 py-3 text-right text-gray-500 tabular-nums">{s.missing}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.sum}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.mean}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.median}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.min}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.max}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.stdDev}</td>
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
            <div className="px-5 py-3.5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Categorical Attributes</h3>
              <span className="text-xs text-gray-400">{categoricalSummary.length} columns</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Column</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Missing</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Unique Count</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Value (Freq)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoricalSummary.map(s => (
                    <tr key={s.label} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{s.label}</td>
                      <td className="px-5 py-3 text-right text-gray-500 tabular-nums">{s.missing}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.unique}</td>
                      <td className="px-5 py-3 text-right text-gray-700 truncate max-w-[200px]">{s.topValue}</td>
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
