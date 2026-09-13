import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  BarChart2, 
  PieChart, 
  Users, 
  Settings, 
  Activity,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDataStore } from '../../store/useDataStore';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Activity, label: 'Real-time', active: false },
    { icon: BarChart2, label: 'Analytics', active: false },
    { icon: Users, label: 'Audience', active: false },
    { icon: PieChart, label: 'Reports', active: false },
  ];

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen sticky top-0 flex flex-col glass-panel border-r-slate-700/50 border-r z-20"
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-700/50">
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 font-bold text-lg text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
              <BarChart2 size={18} className="text-white" />
            </div>
            DataFlow
          </motion.div>
        )}
        {!isOpen && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
            <BarChart2 size={18} className="text-white" />
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-1 rounded-md hover:bg-slate-700/50 text-slate-400 transition-colors",
            !isOpen && "absolute -right-3 top-5 bg-slate-800 border border-slate-600 rounded-full shadow-lg"
          )}
        >
          <ChevronLeft size={18} className={cn("transition-transform duration-300", !isOpen && "rotate-180")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
              item.active 
                ? "bg-slate-700/50 text-white shadow-inner" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            {item.active && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute left-0 w-1 h-8 bg-neon-cyan rounded-r-full"
              />
            )}
            <item.icon size={20} className={cn(item.active ? "text-neon-cyan" : "text-slate-400 group-hover:text-slate-200")} />
            {isOpen && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700/50 flex flex-col gap-2">
        <button 
          onClick={() => useDataStore.getState().setSettingsOpen(true)}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all"
        >
          <Settings size={20} />
          {isOpen && <span className="font-medium text-sm">Settings</span>}
        </button>
        <button className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={20} />
          {isOpen && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
