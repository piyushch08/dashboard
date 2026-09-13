import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../layout/Sidebar';

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColorClass?: string;
  delay?: number;
}

export function KpiCard({ title, value, change, icon: Icon, iconColorClass = "text-neon-cyan", delay = 0 }: KpiCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={120} />
      </div>
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-400">{title}</span>
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 shadow-inner border border-slate-700/50",
          iconColorClass
        )}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md",
          isPositive ? "bg-neon-emerald/20 text-neon-emerald" : "bg-red-500/20 text-red-400"
        )}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-xs text-slate-500">vs last month</span>
      </div>
    </motion.div>
  );
}
