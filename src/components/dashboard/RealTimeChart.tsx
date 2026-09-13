import { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { Activity } from 'lucide-react';
import { motion } from 'motion/react';

// Generate initial mock data
const generateData = () => {
  const now = new Date();
  const data = [];
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2000);
    data.push({
      time: time.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
      users: Math.floor(Math.random() * 50) + 100,
      requests: Math.floor(Math.random() * 200) + 500,
    });
  }
  return data;
};

export function RealTimeChart() {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((currentData) => {
        const newData = [...currentData];
        newData.shift(); // Remove oldest
        
        const lastValue = newData[newData.length - 1];
        const newUsers = Math.max(50, Math.min(250, lastValue.users + (Math.random() * 30 - 15)));
        const newRequests = Math.max(300, Math.min(1000, lastValue.requests + (Math.random() * 100 - 50)));
        
        newData.push({
          time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          users: Math.floor(newUsers),
          requests: Math.floor(newRequests),
        });
        
        return newData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-panel p-6 rounded-2xl col-span-1 lg:col-span-2 flex flex-col h-[400px]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
            <Activity size={18} className="text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Live Server Traffic</h3>
            <p className="text-xs text-slate-400">Updating every 2 seconds</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]"></div>
            <span className="text-slate-300">Active Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(157,0,255,0.8)]"></div>
            <span className="text-slate-300">Requests/sec</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9D00FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9D00FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={10} 
              tickMargin={10} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickMargin={10} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="users" 
              stroke="#00F0FF" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsers)" 
              isAnimationActive={false} // Disable animation for smoother continuous flow
            />
            <Area 
              type="monotone" 
              dataKey="requests" 
              stroke="#9D00FF" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorReqs)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
