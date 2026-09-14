import React from 'react';
import { FileText, Zap, Calendar, ShoppingBag, SlidersHorizontal, Bell, Settings } from 'lucide-react';

export function InvoicesHeader() {
  const navItems = [
    { label: 'Overview', active: false },
    { label: 'Estimates', active: false },
    { label: 'Invoices', active: true },
    { label: 'Payments', active: false },
    { label: 'Recurring', active: false },
    { label: 'Checkouts', active: false },
  ];

  return (
    <div className="flex items-center justify-between w-full pb-4">
      
      {/* Logo Area */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center bg-blue-100 text-[#4D45E4] rounded-lg p-2 font-bold text-xl h-10 w-10">
          {/* Mock Logo Icon */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M4 4h4v16H4V4zm6 6h4v10h-4V10zm6-6h4v16h-4V4z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">FINNOVA</h2>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">Smart Finances, Better Business</p>
        </div>
        <div className="ml-4 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-600">
          80
        </div>
      </div>

      {/* Center Navigation Pill */}
      <div className="bg-[#1C1C21] rounded-full p-1.5 flex items-center shadow-md">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              item.active 
                ? 'bg-[#4D45E4] text-white' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.active && <span className="text-[10px]">✦</span>}
            {item.label}
          </button>
        ))}
      </div>

      {/* Right Icons Area */}
      <div className="flex items-center gap-2">
        <IconButton icon={<FileText size={18} />} />
        <IconButton icon={<Zap size={18} />} />
        <IconButton icon={<Calendar size={18} />} />
        <IconButton icon={<ShoppingBag size={18} />} />
        <IconButton icon={<SlidersHorizontal size={18} />} />
        
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        
        <IconButton icon={<Bell size={18} />} notification />
        <IconButton icon={<Settings size={18} />} />
        
        <div className="ml-2 h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90">
          {/* Avatar placeholder */}
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon, notification }: { icon: React.ReactNode, notification?: boolean }) {
  return (
    <button className="relative p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
      {icon}
      {notification && (
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      )}
    </button>
  );
}
