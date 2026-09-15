import { useMemo } from 'react';
import type { ColumnMeta } from '../../store/useDataStore';
import { generateInsights } from '../../utils/statistics';
import { Lightbulb, AlertTriangle, Info, TrendingUp, GitBranch } from 'lucide-react';

interface InsightsPanelProps {
  dataset: any[];
  numericCols: ColumnMeta[];
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

export function InsightsPanel({ dataset, numericCols }: InsightsPanelProps) {
  const insights = useMemo(
    () => generateInsights(dataset, numericCols),
    [dataset, numericCols]
  );

  return (
    <section
      className="card p-5 flex flex-col h-[380px]"
      aria-label={`Auto insights: ${insights.length} finding${insights.length !== 1 ? 's' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-amber-100" aria-hidden="true">
          <Lightbulb size={16} className="text-warning" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Auto Insights</h3>
        <span className="ml-auto text-sm font-medium text-slate-600 tabular-nums">
          {insights.length} finding{insights.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Insights list — scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center gap-2">
            <Info size={24} />
            <span>Upload a dataset with numeric columns to see insights.</span>
          </div>
        ) : (
          insights.map((insight, i) => {
            const Icon = TYPE_ICON[insight.type] ?? Info;
            const style = SEVERITY_STYLE[insight.severity];
            return (
              <div
                key={i}
                className={`flex gap-3 p-4 rounded-xl border ${style.wrapper} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                role="listitem"
              >
                <Icon
                  size={16}
                  className={`flex-shrink-0 mt-0.5 ${style.icon}`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className={`text-sm font-bold leading-snug ${style.title}`}>
                    {insight.title}
                  </p>
                  <p className={`text-sm mt-1 leading-relaxed ${style.body} font-medium`}>
                    {insight.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer note */}
      <p className="mt-3 text-xs text-slate-500 flex-shrink-0 leading-relaxed">
        Insights computed from {dataset.length.toLocaleString()} records in real time.
      </p>
    </section>
  );
}
