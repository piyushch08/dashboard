import { useDataStore } from '../../store/useDataStore';
import { Download, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export function ReportsView() {
  const { dataset, columns } = useDataStore();
  const [exported, setExported] = useState<string | null>(null);

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
    setTimeout(() => setExported(null), 2000);
  };

  const numericCols = columns.filter(c => c.type === 'number');

  // Generate a simple text summary
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

      {/* Export buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={exportCSV}
          className="card p-5 flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer text-center"
        >
          {exported === 'csv' ? <Check size={24} className="text-success" /> : <FileText size={24} className="text-gray-400" />}
          <div>
            <p className="text-sm font-medium text-gray-900">Export CSV</p>
            <p className="text-xs text-gray-400 mt-0.5">Comma-separated values</p>
          </div>
        </button>

        <button 
          onClick={exportExcel}
          className="card p-5 flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer text-center"
        >
          {exported === 'xlsx' ? <Check size={24} className="text-success" /> : <FileSpreadsheet size={24} className="text-gray-400" />}
          <div>
            <p className="text-sm font-medium text-gray-900">Export Excel</p>
            <p className="text-xs text-gray-400 mt-0.5">.xlsx spreadsheet</p>
          </div>
        </button>

        <button 
          onClick={exportJSON}
          className="card p-5 flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer text-center"
        >
          {exported === 'json' ? <Check size={24} className="text-success" /> : <Download size={24} className="text-gray-400" />}
          <div>
            <p className="text-sm font-medium text-gray-900">Export JSON</p>
            <p className="text-xs text-gray-400 mt-0.5">Raw JSON format</p>
          </div>
        </button>
      </div>

      {/* Summary report */}
      {summary.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Summary Report</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Sum</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Mean</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Min</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.map(s => (
                  <tr key={s.label} className="hover:bg-gray-50">
                    <td className="px-5 py-2.5 font-medium text-gray-900">{s.label}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{s.sum}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{s.mean}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{String(s.min)}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{String(s.max)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
