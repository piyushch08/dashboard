import React from 'react';
import { Plus, ArrowUpRight, Link2, Calendar as CalendarIcon } from 'lucide-react';

export function InvoiceDetails() {
  return (
    <div className="h-full bg-[#5D54EB] rounded-[28px] p-6 sm:p-8 flex flex-col text-white relative overflow-hidden mr-2 mb-2">
      
      {/* Background graphic elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Header section */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8 z-10">
        <div>
          <div className="text-white/70 text-sm mb-1">Invoice details</div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold"># INV-1003</h2>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium">Unsent</span>
          </div>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="text-white/70 text-sm mb-1">Company</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">BrightWave</span>
              <svg className="text-white/80 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
            </div>
          </div>
          
          <div>
            <div className="text-white/70 text-sm mb-1">Customer</div>
            <div className="flex items-center gap-2">
              <img src="https://i.pravatar.cc/150?u=3" alt="Customer" className="w-8 h-8 rounded-full border border-white/20" />
              <div>
                <div className="font-semibold text-sm leading-tight">James Carter</div>
                <div className="text-white/60 text-xs">Marketing Director</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-auto z-10">
        
        <div className="bg-white/10 rounded-2xl p-4 border border-white/5 hover:bg-white/15 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="text-xl font-bold">$ 15,990.00</div>
            <ArrowUpRight size={18} className="text-white/40 group-hover:text-white/80 transition-colors" />
          </div>
          <div className="text-white/60 text-sm">UI/UX Design</div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/5 hover:bg-white/15 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="text-xl font-bold">$ 21,250.00</div>
            <ArrowUpRight size={18} className="text-white/40 group-hover:text-white/80 transition-colors" />
          </div>
          <div className="text-white/60 text-sm">Development</div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/5 hover:bg-white/15 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="text-xl font-bold">$ 10,740.00</div>
            <ArrowUpRight size={18} className="text-white/40 group-hover:text-white/80 transition-colors" />
          </div>
          <div className="text-white/60 text-sm">QA & Testing</div>
        </div>

        {/* Add Item Card */}
        <div className="border border-dashed border-white/30 rounded-2xl p-4 flex flex-col items-center justify-center text-white/50 hover:text-white hover:border-white/60 hover:bg-white/5 transition-all cursor-pointer min-h-[100px]">
          <Plus size={20} className="mb-1" />
          <span className="text-sm font-medium">Add item</span>
        </div>

      </div>

      {/* Footer Area */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-end justify-between gap-4 z-10">
        
        <div className="flex gap-8 sm:gap-12 flex-1">
          <div>
            <div className="text-white/60 text-xs font-medium mb-1">Sub Total</div>
            <div className="text-xl font-bold">$ 47,980.00</div>
          </div>
          <div>
            <div className="text-white/60 text-xs font-medium mb-1">Total</div>
            <div className="text-xl font-bold">$ 47,980.00</div>
          </div>
          <div>
            <div className="text-white/60 text-xs font-medium mb-1">Balance Due</div>
            <div className="text-xl font-bold">$ 47,980.00</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Link2 size={18} />
          </button>
          <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
            <CalendarIcon size={18} />
          </button>
          <button className="bg-white text-[#5D54EB] px-6 py-2.5 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-sm ml-2">
            Payout now
          </button>
        </div>

      </div>

    </div>
  );
}
