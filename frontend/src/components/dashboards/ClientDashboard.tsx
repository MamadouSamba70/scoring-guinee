import { useQuery } from '@tanstack/react-query'
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  HelpCircle,
  Smartphone
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
      return res.json()
    },
    enabled: !!user?.client_id
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-white rounded-2xl" />

  const status = clientInfo?.status || 'en_attente'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Statut */}
      <div className={clsx(
        "card-premium border-t-8",
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Statut de votre dossier</p>
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {status === 'en_attente' ? "En attente de validation" : 
                 status === 'valide' ? "Dossier Validé" : "Dossier Refusé"}
              </h2>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-medium text-slate-500">Dernière mise à jour</p>
            <p className="font-bold text-slate-900">{new Date(clientInfo?.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {status === 'valide' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card-premium bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Zap className="w-24 h-24 text-guinee-yellow" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">Votre Résultat de Scoring</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold text-guinee-green">74.5</span>
                  <span className="text-slate-400 text-lg">/100</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-guinee-green/20 text-guinee-green rounded-full text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Éligible au crédit
                </div>
              </div>
            </div>

            <div className="card-premium">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Conseils de l'IA pour votre entreprise</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-900">Régularité :</span> Votre flux de transactions est excellent. Continuez à utiliser Orange Money pour toutes vos ventes.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-900">Opportunité :</span> En augmentant votre solde moyen de 20%, vous pourriez débloquer un prêt 30% plus important.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-premium p-6 border-dashed border-2 border-slate-200 bg-transparent flex flex-col items-center text-center">
              <div className="p-4 bg-slate-100 rounded-2xl mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Télécharger mon Certificat</h4>
              <p className="text-xs text-slate-500 mb-4">Document officiel de score pour présentation en agence.</p>
              <button className="w-full btn-primary text-xs py-2">Exporter PDF</button>
            </div>

            <div className="card-premium p-6 bg-primary-600 text-white">
              <HelpCircle className="w-8 h-8 mb-4 opacity-50" />
              <h4 className="font-bold mb-2">Besoin d'aide ?</h4>
              <p className="text-xs text-primary-100 mb-4">Contactez un agent CRG pour discuter de votre dossier.</p>
              <button className="w-full bg-white text-primary-600 font-bold text-xs py-2 rounded-xl">Appeler le 622...</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-premium p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Analyse en cours par l'administrateur</h3>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            Votre dossier a été transmis avec succès. Un agent de la direction examine actuellement vos informations 
            et la conformité de vos données mobile money. Vous recevrez une notification dès que votre score sera prêt.
          </p>
          <div className="mt-10 pt-10 border-t border-slate-100 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-guinee-green text-white flex items-center justify-center text-xs font-bold italic">1</div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Envoi</span>
              <span className="text-[10px] text-guinee-green font-bold">Terminé</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold italic">2</div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validation</span>
              <span className="text-[10px] text-amber-600 font-bold">En cours...</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-30">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold italic">3</div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Résultat</span>
              <span className="text-[10px] text-slate-400 font-bold">À venir</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard
