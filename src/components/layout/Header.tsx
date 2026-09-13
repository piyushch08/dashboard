import { Search, Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex-1 max-w-sm relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>
      
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
        </button>
        
        <div className="h-6 w-px bg-gray-200" />
        
        <button className="flex items-center gap-2.5 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-medium text-gray-900 leading-tight">Admin</span>
          </div>
        </button>
      </div>
    </header>
  );
}
