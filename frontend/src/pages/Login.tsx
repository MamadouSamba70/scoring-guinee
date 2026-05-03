import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react'

const Login = () => {
  const [identifier, setIdentifier] = useState('admin@scoring-guinee.gn')
  const [password, setPassword] = useState('Admin2024!')
  const [isLoading, setIsLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      if (!response.ok) {
        throw new Error('Identifiants invalides')
      }

      const data = await response.json()
      
      const userResponse = await fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` },
      })
      
      const userData = await userResponse.json()
      
      setAuth(userData, data.access_token)
      toast.success(`Bienvenue, ${userData.full_name}`)
      navigate('/app')
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Côté Gauche - Branding & Logo */}
      <div className="w-full md:w-1/2 bg-slate-900 relative flex items-center justify-center p-8 overflow-hidden">
        {/* Cercles décoratifs en arrière-plan */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-guinee-green/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 text-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <Link 
            to="/" 
            className="absolute top-0 left-0 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group mb-12"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>

          <div className="flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="Logo Scoring-Guinée" 
              className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl" 
            />
            <div className="mt-8 space-y-2">
              <h1 className="text-4xl font-display font-bold text-white tracking-tight">Scoring-Guinée</h1>
              <p className="text-guinee-green font-medium text-lg italic opacity-90">
                "Votre confiance, notre engagement, votre avenir."
              </p>
            </div>
          </div>

          <div className="pt-12 grid grid-cols-3 gap-6 text-slate-400 border-t border-slate-800">
            <div className="text-center">
              <p className="text-xl font-bold text-white">94%</p>
              <p className="text-[10px] uppercase tracking-wider">Précision</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">IA</p>
              <p className="text-[10px] uppercase tracking-wider">Moteur</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">GN</p>
              <p className="text-[10px] uppercase tracking-wider">Inclusion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Côté Droit - Formulaire de connexion */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Connexion Portail</h2>
            <p className="text-slate-500">Accédez à votre espace sécurisé d'analyse crédit.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email ou Téléphone</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                    placeholder="nom@institution.gn"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">Mot de passe oublié ?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 transition-all duration-300 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter au système
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 text-center border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">Vous êtes un entrepreneur ?</p>
            <Link to="/portal" className="inline-flex items-center px-6 py-2.5 bg-guinee-green/10 text-guinee-green font-bold rounded-full hover:bg-guinee-green/20 transition-all">
              Consulter mon score ici
            </Link>
          </div>

          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-8">
            &copy; 2024 Scoring-Guinée. Système d'Analyse Crédit.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
