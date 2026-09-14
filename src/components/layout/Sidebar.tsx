import { 
  LayoutDashboard, 
  BarChart2, 
  Table2, 
  FileDown, 
  Settings, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDataStore } from '../../store/useDataStore';
import type { PageView } from '../../store/useDataStore';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { currentPage, setCurrentPage, dataset, clearData } = useDataStore();

  const navItems: { icon: React.ElementType; label: string; page: PageView }[] = [
    { icon: LayoutDashboard, label: 'Overview', page: 'overview' },
    { icon: BarChart2, label: 'Analytics', page: 'analytics' },
    { icon: Table2, label: 'Data Table', page: 'data-table' },
    { icon: FileDown, label: 'Reports', page: 'reports' },
  ];

  const handleNav = (page: PageView) => {
    if (dataset.length > 0) {
      setCurrentPage(page);
    }
  };

  return (
    <aside
      aria-label="Main navigation"
      style={{ width: isOpen ? 240 : 72 }}
      className={cn(
        "h-screen flex flex-col bg-white border-r border-slate-200/80 z-40 transition-all duration-300",
        "absolute md:sticky top-0 left-0",
        !isOpen && "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo / branding */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        {isOpen && (
          <div className="flex items-center gap-2.5">
            {/* DataFlow brand mark — matches browser tab favicon */}
            <img
              src="/favicon.svg"
              alt="DataFlow logo"
              className="w-8 h-8 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="font-bold text-gray-900 text-base tracking-tight">DataFlow</span>
          </div>
        )}
        {!isOpen && (
          <img
            src="/favicon.svg"
            alt="DataFlow logo"
            className="w-8 h-8 mx-auto flex-shrink-0"
            aria-label="DataFlow"
          />
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className={cn(
            "p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors focus-visible:outline-none",
            !isOpen && "hidden md:block absolute -right-3 top-5 bg-white border border-slate-200 rounded-full shadow-sm"
          )}
        >
          <ChevronLeft size={16} className={cn("transition-transform duration-200", !isOpen && "rotate-180")} aria-hidden="true" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3" aria-label="Page navigation">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const isDisabled = dataset.length === 0;
          return (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              aria-disabled={isDisabled}
              aria-current={isActive ? 'page' : undefined}
              title={!isOpen ? item.label : undefined}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm w-full text-left",
                isActive
                  ? "bg-primary-light text-primary font-medium shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-gray-800",
                isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-600"
              )}
            >
              <item.icon
                size={18}
                aria-hidden="true"
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-primary" : "text-slate-500"
                )}
              />
              {isOpen && <span className="whitespace-nowrap truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 flex flex-col gap-1">
        <button
          onClick={() => useDataStore.getState().setSettingsOpen(true)}
          title={!isOpen ? 'Settings' : undefined}
          aria-label="Open settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-gray-800 transition-colors text-sm w-full text-left"
        >
          <Settings size={18} aria-hidden="true" className="flex-shrink-0" />
          {isOpen && <span>Settings</span>}
        </button>
        <button
          onClick={() => { clearData(); }}
          title={!isOpen ? 'Clear data & logout' : undefined}
          aria-label="Clear data and logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-danger transition-colors text-sm w-full text-left"
        >
          <LogOut size={18} aria-hidden="true" className="flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
