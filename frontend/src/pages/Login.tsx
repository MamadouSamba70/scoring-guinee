import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import { ShieldCheck, ArrowRight, Lock, Mail, ChevronLeft } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('admin@scoring-guinee.gn')
  const [password, setPassword] = useState('Admin2024!')
  const [isLoading, setIsLoading] = useState(false)
  const setAuth = useAuthStore(state => state.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password: password })
      })
      const data = await res.json()
      if (res.ok) {
        setAuth(data.user, data.access_token)
        toast.success('Bienvenue dans le système')
        navigate('/app')
      } else {
        let errorMessage = 'Identifiants invalides'
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail[0]?.msg || 'Erreur de validation'
          }
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-slate-950 font-sans">
      {/* Background avec overlay dynamique */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ backgroundImage: 'url("/premium-bg.png")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/40 to-slate-950/90" />
      
      {/* Éléments décoratifs animés (glows) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-guinee-green/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-guinee-red/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg animate-reveal">
        <div className="dark-glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-2xl">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 mb-6 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-guinee-green/30 transition-all duration-500" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-[3px] border-white/10 shadow-2xl animate-float bg-white">
                <img src="/logo.png" alt="Sceau Académique" className="w-full h-full object-cover scale-105" />
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
                Scoring-<span className="text-guinee-green">Guinée</span>
              </h1>
              <div className="h-1 w-12 bg-gradient-to-r from-guinee-red via-guinee-yellow to-guinee-green mx-auto rounded-full" />
              <p className="text-slate-400 text-xs font-bold uppercase mt-2">Portail Professionnel</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-guinee-green transition-colors">
                  Identifiant Professionnel
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-guinee-green/50 focus:border-guinee-green/50 transition-all text-white font-medium outline-none"
                    placeholder="nom@scoring.gn"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-guinee-green transition-colors">
                  Code de Sécurité
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-guinee-green/50 focus:border-guinee-green/50 transition-all text-white font-medium outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-guinee-green/20 via-transparent to-guinee-red/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative z-10 uppercase tracking-wider">Accéder au Système</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-guinee-green" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Système Sécurisé • Souveraineté Financière</span>
            </div>
            
            <div className="flex items-center gap-8">
              <Link to="/portal" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider underline decoration-guinee-green/50 underline-offset-4">
                Portail Public
              </Link>
              <Link to="/" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Retour
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
