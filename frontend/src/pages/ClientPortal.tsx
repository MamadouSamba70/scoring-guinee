import { useState } from 'react'
import { 
  Zap, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Smartphone,
  ShieldCheck,
  ChevronLeft
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background abstract decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-guinee-yellow rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-guinee-green rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link to="/login" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors mb-6 uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Accès Professionnel
          </Link>
          <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-3xl shadow-xl mb-6">
            <Zap className="w-10 h-10 text-guinee-yellow" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Mon Score Crédit</h1>
          <p className="text-slate-500">Service d'inclusion financière — République de Guinée</p>
        </div>

        {!result ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
            <p className="text-sm text-slate-600 mb-6 text-center">
              Entrez votre numéro de téléphone Mobile Money pour consulter votre éligibilité.
            </p>
            <form onSubmit={handleCheck} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Téléphone (Orange / MTN)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl text-lg font-semibold focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="622 00 00 00"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Vérifier mon score
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-tighter font-bold">
              <ShieldCheck className="w-3 h-3" />
              Données protégées par la réglementation de la BCRG
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Bonjour,</p>
                <h2 className="text-xl font-bold text-slate-900">{result.client_name}</h2>
              </div>
              <button onClick={() => setResult(null)} className="text-xs font-bold text-primary-600">Changer</button>
            </div>

            {!result.has_score ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-600">{result.message}</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <div className={clsx(
                    "inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4",
                    result.decision === 'approuve' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {result.decision === 'approuve' ? "Éligible" : "Non éligible"}
                  </div>
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                      <circle 
                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * result.score) / 100}
                        className={clsx(
                          "transition-all duration-1000 ease-out",
                          result.categorie_risque === 'faible' ? "text-guinee-green" : 
                          result.categorie_risque === 'moyen' ? "text-guinee-yellow" : "text-guinee-red"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-slate-900">{Math.round(result.score)}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Notre analyse</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {result.decision === 'approuve' 
                      ? "Félicitations ! Votre profil mobile money est solide. Vous pouvez vous rendre dans une agence CRG pour finaliser votre demande."
                      : "Votre score est actuellement trop bas pour une approbation automatique. Continuez à utiliser régulièrement votre compte mobile money."}
                  </p>
                </div>

                <div className="text-center text-[10px] text-slate-400">
                  Dernière mise à jour : {new Date(result.created_at).toLocaleDateString()}
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
