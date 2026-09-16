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
      className="card col-span-1 lg:col-span-2 flex flex-col h-[400px]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
            <Activity size={18} className="text-[#8b5cf6]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">Live Server Traffic</h3>
            <p className="text-xs text-slate-600">Updating every 2 seconds</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
            <span className="text-slate-600">Active Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#94a3b8]"></div>
            <span className="text-slate-600">Requests/sec</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="time" 
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
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }}
              itemStyle={{ color: '#8b5cf6', fontSize: '12px' }}
              labelStyle={{ color: '#475569', marginBottom: '4px', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="users" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsers)" 
              isAnimationActive={false} // Disable animation for smoother continuous flow
            />
            <Area 
              type="monotone" 
              dataKey="requests" 
              stroke="#94a3b8" 
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
