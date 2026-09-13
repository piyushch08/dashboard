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
      style={{ width: isOpen ? 240 : 72 }}
      className="h-screen sticky top-0 flex flex-col bg-white border-r border-gray-200 z-20 transition-[width] duration-200"
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        {isOpen && (
          <div className="flex items-center gap-2.5 font-semibold text-gray-900">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            DataFlow
          </div>
        )}
        {!isOpen && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-primary flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors",
            !isOpen && "absolute -right-3 top-5 bg-white border border-gray-200 rounded-full shadow-sm"
          )}
        >
          <ChevronLeft size={16} className={cn("transition-transform duration-200", !isOpen && "rotate-180")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const isDisabled = dataset.length === 0;
          return (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                isActive
                  ? "bg-primary-light text-primary font-medium" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-500"
              )}
            >
              <item.icon size={18} />
              {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-100 flex flex-col gap-1">
        <button 
          onClick={() => useDataStore.getState().setSettingsOpen(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-sm"
        >
          <Settings size={18} />
          {isOpen && <span>Settings</span>}
        </button>
        <button 
          onClick={() => { clearData(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-danger transition-colors text-sm"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
