import { useState } from 'react'
import { Menu, X, Search, Star, ClipboardList, Calendar, BarChart3, FileText, Building2, Settings as SettingsIcon } from 'lucide-react'

interface SidebarProps {
  onNavigate: (page: string) => void
  currentPage: string
  isPro: boolean
}

export default function Sidebar({ onNavigate, currentPage, isPro }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Search Grants', page: 'search', icon: Search, prOnly: false },
    { name: 'Saved Grants', page: 'saved', icon: Star, prOnly: false },
    { name: 'Application Tracker', page: 'tracker', icon: ClipboardList, prOnly: true },
    { name: 'Calendar', page: 'calendar', icon: Calendar, prOnly: true },
    { name: 'Analytics', page: 'analytics', icon: BarChart3, prOnly: true },
    { name: 'LOI Generator', page: 'loi', icon: FileText, prOnly: true },
    { name: 'Fiscal Sponsors', page: 'fiscal', icon: Building2, prOnly: true },
    { name: 'Settings', page: 'settings', icon: SettingsIcon, prOnly: true },
  ]

  const handleNavigate = (page: string) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  const isActive = (page: string) => currentPage === page

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-slate-800 shadow-lg border border-slate-700"
      >
        {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-slate-900 shadow-xl z-40 border-r border-slate-700
          w-64 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            GrantGeenie
          </h2>
          <p className="text-slate-400 text-xs mt-1">Grant Discovery Platform</p>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.page)
            const locked = item.prOnly && !isPro
            
            return (
              <button
                key={item.name}
                onClick={() => !locked && handleNavigate(item.page)}
                disabled={locked}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  transition-colors duration-200 text-left
                  ${active
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                    : locked
                    ? 'text-slate-500 cursor-not-allowed opacity-50'
                    : 'text-slate-300 hover:bg-slate-800'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
                {locked && (
                  <span className="ml-auto text-xs bg-slate-700 px-2 py-0.5 rounded">Pro</span>
                )}
              </button>
            )
          })}
        </nav>

        {!isPro && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-800/50 backdrop-blur border-t border-slate-700">
            <div className="text-center">
              <p className="text-slate-300 text-sm mb-2">Unlock all features</p>
              <button
                onClick={() => window.open('https://buy.stripe.com/test_4gw5lmdQa3S42NW4gi', '_blank')}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold text-sm"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  )
}