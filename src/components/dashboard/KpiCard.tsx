import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../layout/Sidebar';

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColorClass?: string;
  delay?: number;
}

export function KpiCard({ title, value, change, icon: Icon, iconColorClass = "text-primary" }: KpiCardProps) {
  const isPositive = change >= 0;

  return (
    <article
      className="kpi-card card p-5 flex flex-col gap-3 border-l-4 border-l-primary/20 hover:border-l-primary/60"
      aria-label={`${title}: ${value}, ${isPositive ? 'up' : 'down'} ${Math.abs(change)}% versus last month`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider" aria-hidden="true">
            {title}
          </span>
          <span className="text-2xl font-bold text-gray-900 tracking-tight" aria-hidden="true">
            {value}
          </span>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br shadow-sm",
            iconColorClass === "text-primary"
              ? "from-primary/10 to-primary/20"
              : "from-accent/10 to-accent/20",
            iconColorClass
          )}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md",
            isPositive ? "bg-success-light text-success" : "bg-danger-light text-danger"
          )}
          aria-hidden="true"
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-xs text-gray-400" aria-hidden="true">vs last month</span>
      </div>
    </article>
  );
}
