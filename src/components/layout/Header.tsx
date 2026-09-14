import { Search, Bell, User, X, ChevronDown } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useState, useRef, useEffect, useId } from 'react';

export function Header() {
  const { searchQuery, setSearchQuery, dataset, clearData, setSettingsOpen } = useDataStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const searchId = useId();
  const notifId = useId();
  const profileMenuId = useId();

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNotifications) {
          setShowNotifications(false);
          notifBtnRef.current?.focus();
        }
        if (showProfile) {
          setShowProfile(false);
          profileBtnRef.current?.focus();
        }
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications, showProfile]);

  const hasData = dataset.length > 0;

  const notifications = hasData
    ? [
        { text: `${dataset.length} records loaded successfully`, time: 'Just now', read: false },
        { text: 'Data analysis complete', time: '1m ago', read: false },
        { text: 'Ready for export', time: '2m ago', read: true },
      ]
    : [{ text: 'No data loaded yet', time: '', read: true }];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 bg-white border-b border-gray-200/80 sticky top-0 z-10 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-sm relative hidden sm:block">
        <label htmlFor={searchId} className="sr-only">
          {hasData ? 'Filter data records' : 'Search'}
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true" />
        <input
          id={searchId}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={hasData ? 'Filter data...' : 'Search...'}
          aria-label={hasData ? 'Filter data records' : 'Search'}
          className="w-full bg-slate-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Live region for filtered result count */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {searchQuery && hasData
          ? `Showing filtered results`
          : null}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            ref={notifBtnRef}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={showNotifications}
            aria-haspopup="true"
            aria-controls={notifId}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-slate-100"
          >
            <Bell size={18} aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                role="status"
                aria-label={`${unreadCount} unread notifications`}
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white"
              />
            )}
          </button>

          {showNotifications && (
            <div
              id={notifId}
              role="dialog"
              aria-label="Notifications"
              aria-modal="false"
              className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs font-medium text-white bg-primary rounded-full px-2 py-0.5">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <ul className="max-h-64 overflow-y-auto" role="list">
                {notifications.map((n, i) => (
                  <li
                    key={i}
                    className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-primary-light/40' : ''}`}
                  >
                    <p className="text-sm text-gray-700">{n.text}</p>
                    {n.time && <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            ref={profileBtnRef}
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            aria-label="User menu"
            aria-expanded={showProfile}
            aria-haspopup="true"
            aria-controls={profileMenuId}
            className="flex items-center gap-2 hover:bg-slate-100 py-1.5 px-2 rounded-lg transition-colors"
          >
            <div
              className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              <User size={14} className="text-white" />
            </div>
            <div className="hidden md:flex items-center gap-1">
              <span className="text-sm font-medium text-gray-900 leading-tight">Admin</span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>
          </button>

          {showProfile && (
            <div
              id={profileMenuId}
              role="menu"
              aria-label="User options"
              className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-400">admin@dataflow.app</p>
              </div>
              <div className="py-1">
                <button
                  role="menuitem"
                  onClick={() => { setSettingsOpen(true); setShowProfile(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 transition-colors"
                >
                  Settings
                </button>
                <button
                  role="menuitem"
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
