import React from 'react';
import { AlertCircle, CalendarDays, Clock, Lock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer } from 'recharts';

const barData = [
  { name: 'Jul', value: 20 },
  { name: 'Aug', value: 35 },
  { name: 'Sep', value: 45 },
  { name: 'Oct', value: 65 },
  { name: 'Nov', value: 85 },
  { name: 'Dec', value: 95 },
];

const lineData = [
  { name: '1', value: 30 },
  { name: '2', value: 40 },
  { name: '3', value: 35 },
  { name: '4', value: 50 },
  { name: '5', value: 45 },
  { name: '6', value: 60 },
  { name: '7', value: 70 },
  { name: '8', value: 90 },
];

export function InvoicesKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Overdue Card */}
      <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-48 relative overflow-hidden group">
        <div className="flex justify-between items-start z-10">
          <div>
            <h3 className="text-slate-900 font-semibold mb-2">Overdue</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium text-slate-500">$</span>
              <span className="text-3xl font-bold text-slate-900">24,850.00</span>
            </div>
            <div className="flex items-center gap-1 text-red-500 text-xs font-semibold mt-2">
              <ArrowUpRight size={14} />
              <span>12.5% from last month</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm border border-slate-100">
            <AlertCircle size={16} />
          </div>
        </div>
        {/* Placeholder for the desk image in the reference */}
        <div className="absolute bottom-0 right-0 w-32 h-20 bg-gradient-to-tl from-slate-200 to-transparent rounded-tl-full opacity-50"></div>
      </div>

      {/* Due within next month Card */}
      <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-48 relative">
        <div className="flex justify-between items-start z-10">
          <div>
            <h3 className="text-slate-900 font-semibold mb-2">Due within next month</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium text-slate-500">$</span>
              <span className="text-3xl font-bold text-slate-900">142,560.00</span>
            </div>
            <div className="flex items-center gap-1 text-[#4D45E4] text-xs font-semibold mt-2">
              <ArrowUpRight size={14} />
              <span>8.2% from last month</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#4D45E4] shadow-sm border border-slate-100">
            <CalendarDays size={16} />
          </div>
        </div>
        <div className="h-16 w-full mt-4 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <Bar dataKey="value" fill="#818CF8" radius={[4, 4, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average time to get paid Card */}
      <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-48 relative">
        <div className="flex justify-between items-start z-10">
          <div>
            <h3 className="text-slate-900 font-semibold mb-2">Average time to get paid</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">16</span>
              <span className="text-base font-medium text-slate-500">days</span>
            </div>
            <div className="flex items-center gap-1 text-teal-500 text-xs font-semibold mt-2">
              <ArrowDownRight size={14} />
              <span>2 days from last month</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-500 shadow-sm border border-slate-100">
            <Clock size={16} />
          </div>
        </div>
        <div className="h-16 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <Line type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={3} dot={{ r: 3, fill: "#818CF8", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Available for Instant Payout Card */}
      <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-48">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-slate-900 font-semibold mb-2">Available for Instant Payout</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium text-slate-500">$</span>
              <span className="text-3xl font-bold text-slate-900">186,540.00</span>
              <span className="ml-2 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-semibold text-slate-500 uppercase tracking-wider">Expects</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-500 shadow-sm border border-slate-100">
              <Lock size={14} />
            </div>
            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 hover:bg-slate-50">
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-4">
           {/* Payment Methods */}
           <div className="flex gap-2">
             <div className="bg-white rounded-xl py-2 px-3 border border-slate-100 text-center shadow-sm w-[72px]">
               <div className="text-[10px] text-slate-500 font-bold mb-1">•••• 4242</div>
               <div className="text-xs font-medium text-slate-800">Visa</div>
             </div>
             <div className="bg-[#4D45E4] rounded-xl py-2 px-3 text-center shadow-sm w-[72px] transform -translate-y-2 relative">
               <div className="text-[10px] text-white/80 font-bold mb-1">•••• 6789</div>
               <div className="text-xs font-medium text-white">Stripe</div>
               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#4D45E4] rotate-45"></div>
             </div>
             <div className="bg-white rounded-xl py-2 px-3 border border-slate-100 text-center shadow-sm w-[72px]">
               <div className="text-[10px] text-slate-500 font-bold mb-1">•••• 1234</div>
               <div className="text-xs font-medium text-slate-800">PayPal</div>
             </div>
           </div>
           
           <button className="bg-[#1C1C21] hover:bg-black text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors shadow-sm">
             Payout now
           </button>
        </div>
      </div>
    </div>
  );
}
