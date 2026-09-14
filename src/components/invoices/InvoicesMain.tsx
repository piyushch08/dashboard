import React from 'react';
import { InvoicesList } from './InvoicesList';
import { InvoiceDetails } from './InvoiceDetails';

export function InvoicesMain() {
  return (
    <div className="bg-[#1C1C21] rounded-[32px] w-full mt-2 relative p-2 flex flex-col lg:flex-row overflow-hidden min-h-[500px]">
      
      {/* Top inner navigation (All Invoices / Draft / Unpaid) - Absolute positioned in the top center of the dark container */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white rounded-b-[24px] px-4 py-2 flex items-center gap-2 shadow-sm z-10">
        <button className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50">
          All Invoices
        </button>
        <button className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          Draft <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">3</span>
        </button>
        <button className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#4D45E4] text-white flex items-center gap-2 shadow-sm">
          Unpaid <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">5</span>
        </button>
      </div>

      <div className="flex-1 lg:w-[40%] pr-0 lg:pr-2 pt-16 lg:pt-0">
        <InvoicesList />
      </div>
      
      <div className="flex-[2] lg:w-[60%] mt-4 lg:mt-0 pt-16 lg:pt-0">
        <InvoiceDetails />
      </div>

    </div>
  );
}
