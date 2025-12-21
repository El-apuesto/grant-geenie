import { Home, Search, ClipboardList, Calendar as CalendarIcon, FileText, Building2, Lightbulb, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  isPro: boolean;
}

export default function Sidebar({ currentView, onNavigate, onSignOut, isPro }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, proBadge: false },
    { id: 'grants', label: 'Find Grants', icon: Search, proBadge: false },
    { id: 'tracker', label: 'Application Tracker', icon: ClipboardList, proBadge: true },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, proBadge: true },
    { id: 'loi', label: 'LOI Generator', icon: Lightbulb, proBadge: true },
    { id: 'fiscalSponsors', label: 'Fiscal Sponsors', icon: Building2, proBadge: true },
    { id: 'templates', label: 'Templates', icon: FileText, proBadge: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, proBadge: true },
  ];

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700 z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <img 
                src="/Logo.png.PNG" 
                alt="Grant Geenie" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-white">Grant Geenie</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isLocked = item.proBadge && !isPro;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => !isLocked && handleNavigate(item.id)}
                      disabled={isLocked}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-emerald-600 text-white' 
                          : isLocked
                            ? 'text-slate-500 cursor-not-allowed'
                            : 'text-slate-300 hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isLocked && (
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded">Pro</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-slate-700 space-y-2">
            {isPro && (
              <button
                onClick={() => handleNavigate('settings')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            )}
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}