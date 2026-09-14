import { useDataStore } from '../../store/useDataStore';
import { Download, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { useState, useId } from 'react';
import * as XLSX from 'xlsx';

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

function ExportCard({ id, label, description, icon: Icon, activeIcon: ActiveIcon, isActive, onClick, colorClass, bgClass }: ExportCardProps) {
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

  const numericCols = columns.filter(c => c.type === 'number');

  const summary = numericCols.map(col => {
    const nums = dataset.map(r => Number(r[col.key])).filter(n => !isNaN(n));
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = nums.length > 0 ? (sum / nums.length).toFixed(2) : 'N/A';
    const min = nums.length > 0 ? Math.min(...nums) : 'N/A';
    const max = nums.length > 0 ? Math.max(...nums) : 'N/A';
    return { label: col.label, sum: sum.toLocaleString(), mean, min, max };
  });

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

      {/* Summary report table */}
      {summary.length > 0 && (
        <section aria-label="Summary report">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Summary Report</h3>
              <span className="text-xs text-gray-400">{numericCols.length} numeric columns</span>
            </div>
            <div className="overflow-x-auto">
              <table
                id={tableId}
                className="w-full text-sm"
                aria-label="Numeric column summary statistics"
              >
                <caption className="sr-only">
                  Summary statistics for {numericCols.length} numeric columns across {dataset.length} records
                </caption>
                <thead>
                  <tr className="border-b border-gray-100">
                    <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Column</th>
                    <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Sum</th>
                    <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Mean</th>
                    <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Min</th>
                    <th scope="col" className="px-5 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary.map(s => (
                    <tr key={s.label} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{s.label}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.sum}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{s.mean}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{String(s.min)}</td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">{String(s.max)}</td>
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
