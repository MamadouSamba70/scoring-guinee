import { useState } from 'react'
import { 
  Zap, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Smartphone,
  ShieldCheck,
  ChevronLeft,
  Activity
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

const ClientPortal = () => {
  const [telephone, setTelephone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (telephone.length < 9) {
      toast.error('Numéro de téléphone invalide')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/v1/public/check-score?telephone=${telephone}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Aucun dossier trouvé pour ce numéro')
        throw new Error('Une erreur est survenue')
      }
      const data = await res.json()
      setResult(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Premium Background Assets */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-sm scale-105"
        style={{ backgroundImage: 'url("/premium-bg.png")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/80" />
      
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-guinee-yellow/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-guinee-green/5 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-md z-10 animate-reveal">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-white transition-colors mb-8 uppercase group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl animate-float">
              <Zap className="w-8 h-8 text-guinee-yellow" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
              Mon <span className="text-guinee-green">Score</span> Crédit
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase ">Inclusion Financière • République de Guinée</p>
        </div>

        {!result ? (
          <div className="dark-glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-3xl">
            <p className="text-xs font-medium text-slate-400 mb-8 text-center leading-relaxed">
              Veuillez saisir votre numéro Mobile Money pour interroger le moteur de scoring national.
            </p>
            
            <form onSubmit={handleCheck} className="space-y-8">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1 group-focus-within:text-guinee-green transition-colors">
                  Numéro de Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="block w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-xl font-bold text-white focus:ring-2 focus:ring-guinee-green/50 focus:border-guinee-green/50 transition-all outline-none"
                    placeholder="622 00 00 00"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-white text-slate-950 font-bold rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center group uppercase tracking-wider text-xs"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    Vérifier mon éligibilité
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <ShieldCheck className="w-3 h-3 text-guinee-green" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Données Protégées BCRG</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="dark-glass rounded-[2.5rem] p-10 border border-white/10 shadow-3xl animate-reveal">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Identité Vérifiée</p>
                <h2 className="text-xl font-bold text-white tracking-tight">{result.client_name}</h2>
              </div>
              <button 
                onClick={() => setResult(null)} 
                className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {!result.has_score ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium leading-relaxed">{result.message}</p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col items-center">
                  <div className={clsx(
                    "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-8 border",
                    result.decision === 'approuve' 
                      ? "bg-guinee-green/10 text-guinee-green border-guinee-green/20" 
                      : "bg-guinee-red/10 text-guinee-red border-guinee-red/20"
                  )}>
                    {result.decision === 'approuve' ? "Profil Éligible" : "Profil Non Éligible"}
                  </div>
                  
                  <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-guinee-green/20 rounded-full blur-3xl animate-pulse scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="72" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                      <circle 
                        cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={452.4}
                        strokeDashoffset={452.4 - (452.4 * result.score) / 100}
                        strokeLinecap="round"
                        className={clsx(
                          "transition-all duration-[1.5s] ease-out",
                          result.categorie_risque === 'faible' ? "text-guinee-green" : 
                          result.categorie_risque === 'moyen' ? "text-guinee-yellow" : "text-guinee-red"
                        )}
                        style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-bold text-white tracking-tight">{Math.round(result.score)}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score IA</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <Activity className="w-12 h-12" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Analyse Systémique</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {result.decision === 'approuve' 
                      ? "Votre comportement transactionnel Mobile Money démontre une solidité financière. Présentez ce score dans l'agence partenaire la plus proche pour finaliser votre dossier."
                      : "Votre indice de confiance actuel ne permet pas une approbation automatique. Nous vous recommandons d'augmenter la fréquence de vos transactions et d'équilibrer vos flux."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider pt-4">
                  Généré le {new Date(result.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientPortal
