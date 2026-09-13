import { Search, Bell, User, X, ChevronDown } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { searchQuery, setSearchQuery, dataset, clearData, setSettingsOpen } = useDataStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasData = dataset.length > 0;

  const notifications = hasData
    ? [
        { text: `${dataset.length} records loaded successfully`, time: 'Just now', read: false },
        { text: 'Data analysis complete', time: '1m ago', read: false },
        { text: 'Ready for export', time: '2m ago', read: true },
      ]
    : [{ text: 'No data loaded yet', time: '', read: true }];

  return (
    <header className="h-14 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-6">
      {/* Search bar — filters data */}
      <div className="flex-1 max-w-sm relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={hasData ? "Filter data..." : "Search..."}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <Bell size={18} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                <span className="text-xs text-gray-400">{notifications.filter(n => !n.read).length} new</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                    <p className="text-sm text-gray-700">{n.text}</p>
                    {n.time && <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-6 w-px bg-gray-200" />
        
        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="hidden md:flex items-center gap-1">
              <span className="text-sm font-medium text-gray-900 leading-tight">Admin</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-400">admin@dataflow.app</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setSettingsOpen(true); setShowProfile(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Settings
                </button>
                <button 
                  onClick={() => { clearData(); setShowProfile(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
