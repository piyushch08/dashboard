import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../layout/Sidebar';
import {
  ResponsiveContainer, AreaChart, Area, Tooltip,
} from 'recharts';

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColorClass?: string;
  sparkData?: number[];   // Optional: raw values for sparkline
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  iconColorClass = 'text-primary',
  sparkData,
}: KpiCardProps) {
  const isPositive = change >= 0;
  const isNeutral  = change === 0;

  // Build mini sparkline dataset
  const sparkPoints = useMemo(() => {
    if (!sparkData?.length) return [];
    return sparkData.map((v, i) => ({ i, v }));
  }, [sparkData]);

  const sparkColor = isNeutral ? '#475569' : isPositive ? '#059669' : '#dc2626';

  return (
    <article
      className="kpi-card card flex flex-col justify-between min-h-[140px] group"
      aria-label={`${title}: ${value}, ${isNeutral ? 'unchanged' : (isPositive ? 'up' : 'down') + ' ' + Math.abs(change) + '%'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      {/* Row 1: title + icon */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate" aria-hidden="true">
            {title}
          </span>
          <span className="text-2xl font-bold text-primary tracking-tight" aria-hidden="true">
            {value}
          </span>
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            'bg-gradient-to-br shadow-sm',
            iconColorClass === 'text-primary'
              ? 'from-primary/10 to-primary/20'
              : 'from-accent/10 to-accent/20',
            iconColorClass,
          )}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>
      </div>

      {/* Row 2: sparkline (if data provided) */}
      {sparkPoints.length > 1 && (
        <div className="h-14 w-full -mx-1 relative z-10 group-hover:scale-[1.02] transition-transform duration-300" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkPoints} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ display: 'none' }}
                cursor={false}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={1.5}
                fill={`url(#spark-${title})`}
                dot={false}
                isAnimationActive={true}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Row 3: change badge */}
      <div className="flex items-center gap-2 relative z-10" aria-hidden="true">
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md',
            isNeutral
              ? 'bg-slate-100 text-slate-500'
              : isPositive
              ? 'bg-success-light text-success'
              : 'bg-danger-light text-danger',
          )}
        >
          {!isNeutral && (isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
          <span>{isNeutral ? '—' : `${Math.abs(change)}%`}</span>
        </div>
        <span className="text-xs text-slate-500">
          {sparkData ? 'trend' : 'vs avg'}
        </span>
      </div>
    </article>
  );
}
