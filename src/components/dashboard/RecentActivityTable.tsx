import { List } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../layout/Sidebar';

const activityData = [
  { id: '#INV-0012', user: 'Alex Johnson', action: 'Pro Plan Upgrade', amount: '$49.00', status: 'Completed', date: '2 min ago' },
  { id: '#INV-0013', user: 'Sarah Smith', action: 'Enterprise License', amount: '$499.00', status: 'Pending', date: '15 min ago' },
  { id: '#INV-0014', user: 'Michael Brown', action: 'Basic Plan', amount: '$12.00', status: 'Completed', date: '1 hour ago' },
  { id: '#INV-0015', user: 'Emily Davis', action: 'Add-on Purchase', amount: '$25.00', status: 'Failed', date: '3 hours ago' },
  { id: '#INV-0016', user: 'David Wilson', action: 'Pro Plan Upgrade', amount: '$49.00', status: 'Completed', date: '5 hours ago' },
];

export function RecentActivityTable() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="glass-panel p-6 rounded-2xl col-span-1 lg:col-span-3 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center">
            <List size={18} className="text-neon-purple" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Recent Activity</h3>
            <p className="text-xs text-slate-400">Latest transactions and events</p>
          </div>
        </div>
        <button className="text-xs font-semibold text-neon-cyan hover:text-white transition-colors">
          View All
        </button>
      </div>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Transaction</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right pr-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {activityData.map((row) => (
              <tr 
                key={row.id} 
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
              >
                <td className="py-4 pl-2 text-sm font-medium text-slate-300 group-hover:text-neon-cyan transition-colors">{row.id}</td>
                <td className="py-4 text-sm text-white flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {row.user.charAt(0)}
                  </div>
                  {row.user}
                </td>
                <td className="py-4 text-sm text-slate-300">{row.action}</td>
                <td className="py-4 text-sm font-semibold text-white">{row.amount}</td>
                <td className="py-4">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                    row.status === 'Completed' ? "bg-neon-emerald/20 text-neon-emerald" : 
                    row.status === 'Pending' ? "bg-yellow-500/20 text-yellow-500" : 
                    "bg-red-500/20 text-red-400"
                  )}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 pr-2 text-sm text-slate-400 text-right">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
