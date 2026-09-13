import { Search, Bell, User } from 'lucide-react';
import { motion } from 'motion/react';

export function Header() {
  return (
    <header className="h-16 glass-panel border-b border-slate-700/50 sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search reports, metrics..." 
          className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan transition-all"
        />
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Bell size={20} />
          <motion.span 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full"
          />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>
        
        <button className="flex items-center gap-3 hover:bg-slate-800 p-1.5 rounded-full transition-colors pr-4">
          <div className="w-8 h-8 bg-gradient-to-tr from-neon-purple to-neon-pink rounded-full flex items-center justify-center overflow-hidden border border-slate-600">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-white leading-tight">Admin User</span>
            <span className="text-[10px] text-slate-400 leading-tight">Data Scientist</span>
          </div>
        </button>
      </div>
    </header>
  );
}
