import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

const data = [
  { name: 'Organic Search', value: 400, color: '#00F0FF' },
  { name: 'Social Media', value: 300, color: '#9D00FF' },
  { name: 'Direct Traffic', value: 300, color: '#FF007F' },
  { name: 'Referral', value: 200, color: '#10b981' },
];

export function TrafficSourcePieChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-panel p-6 rounded-2xl flex flex-col h-[350px]"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-neon-pink/20 flex items-center justify-center">
          <Globe size={18} className="text-neon-pink" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">Traffic Sources</h3>
          <p className="text-xs text-slate-400">User acquisition channels</p>
        </div>
      </div>
      
      <div className="flex-1 w-full relative flex flex-col lg:flex-row items-center justify-center">
        <div className="h-[200px] w-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Inner glowing circle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-slate-700/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"></div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 mt-4 lg:mt-0 lg:ml-6">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }}
              ></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                <span className="text-[10px] text-slate-500">{item.value} users</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
