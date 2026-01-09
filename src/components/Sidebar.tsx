import { LayoutDashboard, Target, FileText, Search, Settings, ShieldCheck, Menu, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose, profile }: SidebarProps) {
  const { signOut } = useAuth();
  
  // Update: Only check isAgency if profile exists. Safely check organization_type.
  const isAgency = profile?.organization_type === 'Agency';
  const isPro = profile?.subscription_status === 'active';

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pool', icon: Search, label: 'Grant Pool' },
    { id: 'wizard', icon: FileText, label: 'Application Builder' },
    // Only show Agency Tools if organization_type is 'Agency'
    ...(isAgency ? [{ id: 'agency', icon: ShieldCheck, label: 'Agency Tools' }] : []),
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-slate-900" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Grant Geenie
            </h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-slate-900">
          {!isPro && (
            <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <h3 className="font-bold mb-1">Upgrade to Pro</h3>
              <p className="text-sm text-indigo-100 mb-3">Unlock unlimited grant matches and AI writing.</p>
              <button 
                onClick={() => onTabChange('settings')}
                className="w-full py-2 bg-white text-indigo-600 rounded font-semibold text-sm hover:bg-indigo-50 transition"
              >
                View Plans
              </button>
            </div>
          )}
          
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}