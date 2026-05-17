import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  LayoutDashboard, 
  Users, 
  Contact,
  Zap, 
  LogOut, 
  Shield,
  Menu,
  X,
  User as UserIcon,
  History,
  Settings,
  UserCircle
} from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

const Layout = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Tableau de bord', href: '/app', icon: LayoutDashboard, roles: ['admin', 'agent', 'client'] },
    { name: 'Clients', href: '/app/clients', icon: Users, roles: ['admin', 'agent'] },
    { name: 'Agents', href: '/app/agents', icon: Contact, roles: ['admin'] },
    { name: 'Scoring', href: '/app/scoring', icon: Zap, roles: ['admin'] },
    { name: 'Utilisateurs', href: '/app/users', icon: Shield, roles: ['admin'] },
    { name: 'Historique', href: '/app/history', icon: History, roles: ['admin'] },
    { name: 'Profil', href: '/app/profile', icon: UserCircle, roles: ['admin', 'agent', 'client'] },
    { name: 'Paramètres', href: '/app/settings', icon: Settings, roles: ['admin', 'agent'] },
  ].filter(item => item.roles.includes(user?.role || ''))

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Fond décoratif global */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/premium-bg.png')] bg-cover opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-guinee-green/5 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-[260px] flex-col bg-[#0B1221] border-r border-white/5 relative z-10 shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-white shrink-0 flex items-center justify-center hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Sceau Académique" className="w-full h-full object-cover scale-105" />
            </div>
            <div>
              <h2 className="font-sans text-xl font-bold text-white tracking-tight uppercase">Scoring-<span className="text-guinee-green">Guinée</span></h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">MOTEUR DE CRÉDIT ALTERNATIF</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border',
                isActive 
                  ? 'bg-white/10 text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-white'
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx("w-4 h-4 transition-colors", isActive ? "text-white" : "text-slate-500")} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-white shadow-sm">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header Mobile */}
        <header className="lg:hidden bg-[#0B1221] border-b border-white/5 h-16 flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="font-display font-bold text-white">Scoring-Guinée</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-10 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <div className={clsx(
          "lg:hidden fixed inset-y-0 left-0 w-64 bg-[#0B1221] z-30 transform transition-transform duration-300 ease-in-out shadow-xl border-r border-white/5",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
           <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-display font-bold text-white">Scoring-Guinée</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border',
                  isActive 
                    ? 'bg-white/10 text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                    : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </nav>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
