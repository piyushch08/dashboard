import { useMemo, useState, useId } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '../layout/Sidebar';

const PAGE_SIZE = 15;

export function DataTableView() {
  const { dataset, columns, searchQuery } = useDataStore();
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const tableId = useId();
  const captionId = useId();

  const filteredData = useMemo(() => {
    let data = dataset;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(q))
      );
    }
    if (sortCol) {
      data = [...data].sort((a, b) => {
        const va = a[sortCol] ?? '';
        const vb = b[sortCol] ?? '';
        const numA = Number(va);
        const numB = Number(vb);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return data;
  }, [dataset, searchQuery, sortCol, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pageData = filteredData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
    setPage(0);
  };

  const getSortIcon = (colKey: string) => {
    if (sortCol !== colKey) return <ArrowUpDown size={12} className="text-gray-300" aria-hidden="true" />;
    return sortAsc
      ? <ArrowUp size={12} className="text-primary" aria-hidden="true" />
      : <ArrowDown size={12} className="text-primary" aria-hidden="true" />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Data Table</h1>
        <p className="text-sm text-slate-600 mt-0.5" aria-live="polite">
          {filteredData.length} rows{searchQuery ? ' (filtered)' : ''}
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table
            id={tableId}
            className="w-full text-sm"
            aria-label={`Data table with ${filteredData.length} rows${searchQuery ? ' (filtered)' : ''}`}
            aria-describedby={captionId}
          >
            <caption id={captionId} className="sr-only">
              {filteredData.length} records{searchQuery ? ` matching "${searchQuery}"` : ''}
              {sortCol ? `, sorted by ${sortCol} ${sortAsc ? 'ascending' : 'descending'}` : ''}
            </caption>
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50">
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12"
                >
                  #
                </th>
                {columns.map(col => (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => handleSort(col.key)}
                    aria-sort={
                      sortCol === col.key
                        ? sortAsc ? 'ascending' : 'descending'
                        : 'none'
                    }
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-gray-800 hover:bg-slate-100 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-xs text-gray-300 tabular-nums">
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className="px-4 py-2.5 text-gray-700 whitespace-nowrap max-w-[200px] truncate"
                    >
                      {row[col.key] != null
                        ? String(row[col.key])
                        : <span className="text-gray-300 italic text-xs" aria-label="null value">—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">🔍</span>
                      <span>No matching records found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-slate-50/60"
            aria-label="Table pagination"
          >
            <span className="text-xs text-slate-600">
              Page <span className="font-medium text-gray-700">{page + 1}</span> of{' '}
              <span className="font-medium text-gray-700">{totalPages}</span>
              <span className="hidden sm:inline ml-1 text-slate-500">
                ({filteredData.length} total rows)
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                aria-label="First page"
                className="px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                «
              </button>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                aria-label="Previous page"
                className="p-1.5 rounded-md hover:bg-gray-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>

              {/* Page number buttons */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                // Show pages around current
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = idx;
                } else if (page < 3) {
                  pageNum = idx;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + idx;
                } else {
                  pageNum = page - 2 + idx;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    aria-label={`Page ${pageNum + 1}`}
                    aria-current={page === pageNum ? 'page' : undefined}
                    className={cn(
                      "w-8 h-8 rounded-md text-xs font-medium transition-colors",
                      page === pageNum
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-600 hover:bg-gray-200"
                    )}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Next page"
                className="p-1.5 rounded-md hover:bg-gray-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                aria-label="Last page"
                className="px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                »
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
