import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

export function RevenueBarChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="card flex flex-col h-[350px]"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#f3f0ff] flex items-center justify-center">
          <DollarSign size={18} className="text-[#7B3FE4]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">Revenue Overview</h3>
          <p className="text-xs text-slate-600">Monthly breakdown</p>
        </div>
      </div>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#475569" 
              fontSize={10} 
              tickMargin={10} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              tickMargin={10} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }}
              itemStyle={{ color: '#7B3FE4', fontSize: '14px', fontWeight: 'bold' }}
              labelStyle={{ color: '#475569', marginBottom: '4px', fontSize: '12px' }}
            />
            <Bar 
              dataKey="revenue" 
              fill="#7B3FE4" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
