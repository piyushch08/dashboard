import React from 'react';
import { ChevronDown, Calendar as CalendarIcon, Search } from 'lucide-react';

export function InvoicesFilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      
      {/* Active filters pill */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-900 text-sm">Active filters</span>
        <div className="bg-[#1C1C21] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          2
        </div>
      </div>

      <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

      {/* Selects */}
      <div className="flex items-center gap-3 flex-wrap flex-1">
        
        <div className="relative border border-slate-200 rounded-full bg-white hover:bg-slate-50 cursor-pointer transition-colors px-4 py-2 flex items-center justify-between min-w-[140px]">
          <span className="text-sm font-medium text-slate-600">All customers</span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        <div className="relative border border-slate-200 rounded-full bg-white hover:bg-slate-50 cursor-pointer transition-colors px-4 py-2 flex items-center justify-between min-w-[140px]">
          <span className="text-sm font-medium text-slate-600">All statuses</span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        <div className="relative border border-slate-200 rounded-full bg-white hover:bg-slate-50 cursor-pointer transition-colors px-4 py-2 flex items-center justify-between min-w-[150px]">
          <span className="text-sm font-medium text-slate-600">November 2023</span>
          <CalendarIcon size={16} className="text-slate-400" />
        </div>

        <div className="relative border border-slate-200 rounded-full bg-white hover:bg-slate-50 cursor-pointer transition-colors px-4 py-2 flex items-center justify-between min-w-[150px]">
          <span className="text-sm font-medium text-slate-600">December 2023</span>
          <CalendarIcon size={16} className="text-slate-400" />
        </div>

      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-auto">
        <input 
          type="text" 
          placeholder="Enter invoice #" 
          className="w-full sm:w-[220px] pl-4 pr-10 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D45E4] focus:border-transparent placeholder-slate-400"
        />
        <Search size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
      </div>

    </div>
  );
}
