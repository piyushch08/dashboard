import React from 'react';

const invoices = [
  { id: 'INV-1001', days: 'In 2 days', status: 'Unsent', amount: '$68,750.00', active: false, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'INV-1002', days: 'In 4 days', status: 'Viewed', amount: '$21,480.00', active: false, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'INV-1003', days: 'In 5 days', status: 'Unsent', amount: '$47,980.00', active: true, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 'INV-1004', days: 'In 16 days', status: 'Viewed', amount: '$55,230.00', active: false, avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 'INV-1005', days: 'In 19 days', status: 'Viewed', amount: '$6,880.00', active: false, avatar: 'https://i.pravatar.cc/150?u=5' },
];

export function InvoicesList() {
  return (
    <div className="h-full pt-8 px-4 flex flex-col gap-2">
      <div className="flex justify-between items-center mb-4 text-white/90">
        <h3 className="font-semibold text-lg ml-2">Unpaid Invoices</h3>
        <div className="flex gap-2">
           <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>
           </button>
           <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2">
        {invoices.map((inv) => (
          <div 
            key={inv.id} 
            className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border border-transparent ${
              inv.active 
                ? 'bg-[#4D45E4] shadow-md border-white/10' 
                : 'hover:bg-white/5 border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <img src={inv.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-700 object-cover border border-white/10" />
              <div>
                <div className={`font-semibold ${inv.active ? 'text-white' : 'text-slate-200'}`}>
                  # {inv.id}
                </div>
                <div className={`text-xs ${inv.active ? 'text-white/80' : 'text-slate-500'}`}>
                  {inv.days}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                inv.active
                  ? 'bg-white text-[#4D45E4]'
                  : 'bg-white/10 text-slate-300'
              }`}>
                {inv.status}
              </span>
              <span className={`font-semibold text-right min-w-[90px] ${inv.active ? 'text-white' : 'text-slate-200'}`}>
                {inv.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
