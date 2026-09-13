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
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
        </div>
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100",
          iconColorClass
        )}>
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md",
          isPositive ? "bg-success-light text-success" : "bg-danger-light text-danger"
        )}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    </div>
  );
}
