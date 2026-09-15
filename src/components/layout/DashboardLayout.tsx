import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Skip to main content — keyboard / screen-reader accessible */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col relative max-h-screen overflow-y-auto">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main
          id="main-content"
          role="main"
          aria-label="Dashboard content"
          className="p-4 sm:p-6 flex-1"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
