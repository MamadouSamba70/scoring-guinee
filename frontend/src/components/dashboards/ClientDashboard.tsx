import { useQuery } from '@tanstack/react-query'
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  HelpCircle,
  Smartphone,
  XCircle,
  TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { clsx } from 'clsx'

const ClientDashboard = () => {
  const { token, user } = useAuthStore()

  const { data: clientInfo, isLoading } = useQuery({
    queryKey: ['my-client-info'],
    queryFn: async () => {
      const res = await fetch(`/api/v1/clients/${user?.client_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Erreur chargement profil')
      }
      return data
    },
    enabled: !!user?.client_id
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-white rounded-2xl" />

  const status = clientInfo?.status || 'en_attente'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Statut */}
      <div className={clsx(
        "dark-glass rounded-3xl p-8 border border-white/5 border-t-[6px]",
        status === 'valide' ? "border-t-guinee-green" : 
        status === 'refuse' ? "border-t-guinee-red" : "border-t-guinee-yellow"
      )}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-16 h-16 rounded-3xl flex items-center justify-center",
              status === 'valide' ? "bg-green-100 text-green-600" : 
              status === 'refuse' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            )}>
              {status === 'valide' ? <CheckCircle2 className="w-8 h-8" /> : 
               status === 'refuse' ? <XCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statut de votre dossier</p>
              <h2 className="text-2xl font-bold text-white capitalize">
                {status === 'en_attente' ? "En attente de validation" : 
                 status === 'valide' ? "Dossier Validé" : "Dossier Refusé"}
              </h2>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dernière mise à jour</p>
            <p className="font-bold text-white">{new Date(clientInfo?.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {status === 'valide' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="dark-glass rounded-3xl p-8 border border-white/5 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24 text-guinee-yellow" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">Votre Résultat de Scoring</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold text-guinee-green">74.5</span>
                  <span className="text-slate-400 text-lg">/100</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-guinee-green/20 text-guinee-green rounded-full text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Éligible au crédit
                </div>
              </div>
            </div>

            <div className="dark-glass rounded-3xl p-8 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6">Conseils pour votre entreprise</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="font-bold text-white block mb-1">Régularité</span> 
                    Votre flux de transactions est excellent. Continuez à utiliser votre compte mobile pour vos ventes quotidiennes.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="font-bold text-white block mb-1">Opportunité</span> 
                    En augmentant votre solde moyen de 20%, vous pourriez débloquer un plafond de prêt 30% plus important le mois prochain.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="dark-glass rounded-3xl p-8 border-dashed border-2 border-white/10 flex flex-col items-center text-center hover:border-white/20 transition-all cursor-pointer">
              <div className="p-4 bg-white/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">Télécharger mon Certificat</h4>
              <p className="text-xs text-slate-400 mb-6">Document officiel de score pour présentation en agence.</p>
              <button className="w-full bg-white text-slate-900 font-bold text-xs py-3 rounded-xl hover:scale-105 transition-transform">Exporter PDF</button>
            </div>

            <div className="dark-glass rounded-3xl p-8 bg-gradient-to-br from-guinee-green/20 to-transparent border border-white/10 text-white">
              <HelpCircle className="w-8 h-8 mb-4 opacity-50" />
              <h4 className="font-bold mb-2">Besoin d'aide ?</h4>
              <p className="text-xs text-slate-300 mb-6">Contactez un agent CRG pour discuter de votre dossier.</p>
              <button className="w-full bg-white/10 border border-white/20 text-white font-bold text-xs py-3 rounded-xl hover:bg-white/20 transition-colors">Appeler le 622...</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="dark-glass rounded-3xl p-12 border border-white/5 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 text-amber-400">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Analyse en cours par l'équipe</h3>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Votre dossier a été transmis avec succès. Un agent examine actuellement vos informations 
            et la conformité de vos données de transaction. Vous recevrez une notification dès que votre score sera prêt.
          </p>
          <div className="mt-10 pt-10 border-t border-white/10 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-guinee-green text-white flex items-center justify-center text-xs font-bold italic shadow-[0_0_15px_rgba(0,148,96,0.5)]">1</div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Envoi</span>
              <span className="text-xs text-guinee-green font-bold">Terminé</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-80">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center text-xs font-bold italic">2</div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Validation</span>
              <span className="text-xs text-amber-400 font-bold">En cours...</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-40">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center text-xs font-bold italic">3</div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Résultat</span>
              <span className="text-xs text-slate-500 font-bold">À venir</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard
