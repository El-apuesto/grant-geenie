import { Home, Search, ClipboardList, Calendar, FileText, Building2, BarChart3, Settings, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'grants' | 'tracker' | 'calendar' | 'loi' | 'templates' | 'fiscalSponsors' | 'analytics' | 'settings';
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  isPro: boolean;
  isMobile?: boolean;
}

export default function Sidebar({ currentView, onNavigate, onSignOut, isPro, isMobile = false }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-400' },
    { id: 'grants', icon: Search, label: 'Find Grants', color: 'text-emerald-400' },
    { id: 'tracker', icon: ClipboardList, label: 'Application Tracker', color: 'text-purple-400', proOnly: true },
    { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'text-orange-400', proOnly: true },
    { id: 'loi', icon: FileText, label: 'LOI Generator', color: 'text-cyan-400', proOnly: true },
    { id: 'templates', icon: FileText, label: 'Templates', color: 'text-pink-400', proOnly: true },
    { id: 'fiscalSponsors', icon: Building2, label: 'Fiscal Sponsors', color: 'text-yellow-400', proOnly: true },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'text-indigo-400', proOnly: true },
  ];

  const handleItemClick = (itemId: string) => {
    onNavigate(itemId);
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  // Mobile collapsed sidebar (icons only)
  if (isMobile && !isExpanded) {
    return (
      <>
        {/* Mobile hamburger button */}
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      </>
    );
  }

  // Mobile expanded OR Desktop sidebar
  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-700 z-50
          flex flex-col
          ${isMobile ? 'w-64' : 'w-64'}
          ${isMobile && !isExpanded ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-300
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/genie.png.PNG" 
                alt="Grant Geenie" 
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to sparkles icon if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Sparkles className="w-10 h-10 text-emerald-500 hidden" />
              <div>
                <h2 className="text-white font-bold text-lg">Grant Geenie</h2>
                {isPro && (
                  <span className="text-xs text-emerald-400 font-semibold">PRO</span>
                )}
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isLocked = item.proOnly && !isPro;

            return (
              <button
                key={item.id}
                onClick={() => !isLocked && handleItemClick(item.id)}
                disabled={isLocked}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-slate-800 text-white border border-slate-600' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={isLocked ? 'Upgrade to Pro to unlock' : item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isLocked && (
                  <span className="ml-auto text-xs text-slate-500">PRO</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {isPro && (
            <button
              onClick={() => handleItemClick('settings')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${currentView === 'settings'
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          )}
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}