import React from 'react';
import { InvoicesHeader } from './InvoicesHeader';
import { InvoicesKPIs } from './InvoicesKPIs';
import { InvoicesFilterBar } from './InvoicesFilterBar';
import { InvoicesMain } from './InvoicesMain';

export function InvoicesDashboard() {
  return (
    <div className="min-h-screen bg-[#F1F3F5] text-[#1E2024] font-sans flex flex-col items-center py-6 px-4 sm:px-8">
      {/* Main container mimicking the rounded white card in the image */}
      <div className="w-full max-w-[1400px] bg-white rounded-[32px] shadow-sm flex flex-col overflow-hidden p-6 sm:p-8 border border-slate-100">
        
        {/* Top Navigation */}
        <InvoicesHeader />

        {/* Page Title Area */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <div className="flex items-center gap-4">
            <button className="p-2.5 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and track all your invoices in one place.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </button>
            <button className="bg-[#4D45E4] hover:bg-[#4338CA] text-white px-5 py-3 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Create an invoice
            </button>
          </div>
        </div>

        {/* KPIs */}
        <InvoicesKPIs />

        {/* Filters */}
        <InvoicesFilterBar />

        {/* Main Content (Split View) */}
        <InvoicesMain />

      </div>
    </div>
  );
}
