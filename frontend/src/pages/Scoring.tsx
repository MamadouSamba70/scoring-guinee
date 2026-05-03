import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import { clsx } from 'clsx'

const Scoring = () => {
  const location = useLocation()
  const selectedClient = location.state?.client
  const token = useAuthStore(state => state.token)
  const [result, setResult] = useState<any>(null)

  const [formData, setFormData] = useState({
    client_id: selectedClient?.id || null,
    anciennete_mobile_mois: selectedClient?.anciennete_mobile_mois || 24,
    nb_tx_entrees_30j: selectedClient?.nb_tx_entrees_30j || 15,
    montant_moyen_entree_gnf: selectedClient?.montant_moyen_entree_gnf || 1200000,
    regularite_remboursements: selectedClient?.regularite_remboursements || 0.85,
    nb_tx_diaspora_6mois: selectedClient?.nb_tx_diaspora_6mois || 2,
    ratio_depense_revenu: selectedClient?.ratio_depense_revenu || 0.45,
    solde_moyen_gnf: selectedClient?.solde_moyen_gnf || 350000,
    sexe: selectedClient?.sexe || 'M',
    age: selectedClient?.age || 30,
    type_activite: selectedClient?.type_activite || 'commerce',
    zone_geographique: selectedClient?.zone_geographique || 'conakry',
    defaut_passe: selectedClient?.defaut_passe || false
  })

  useEffect(() => {
    if (selectedClient) {
      setFormData({
        client_id: selectedClient.id,
        anciennete_mobile_mois: selectedClient.anciennete_mobile_mois,
        nb_tx_entrees_30j: selectedClient.nb_tx_entrees_30j,
        montant_moyen_entree_gnf: selectedClient.montant_moyen_entree_gnf,
        regularite_remboursements: selectedClient.regularite_remboursements,
        nb_tx_diaspora_6mois: selectedClient.nb_tx_diaspora_6mois,
        ratio_depense_revenu: selectedClient.ratio_depense_revenu,
        solde_moyen_gnf: selectedClient.solde_moyen_gnf,
        sexe: selectedClient.sexe,
        age: selectedClient.age,
        type_activite: selectedClient.type_activite,
        zone_geographique: selectedClient.zone_geographique,
        defaut_passe: selectedClient.defaut_passe
      })
    }
  }, [selectedClient])

  const scoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/v1/scoring', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Erreur de scoring')
      return res.json()
    },
    onSuccess: (data) => {
      setResult(data)
      toast.success('Calcul du score réussi')
    },
    onError: () => {
      toast.error('Une erreur est survenue lors du calcul')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    scoreMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) : value
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Moteur de Scoring</h1>
        <p className="text-slate-500">Évaluez la solvabilité d'un micro-entrepreneur</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Formulaire */}
        <div className="card-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full pb-2 border-b border-slate-100 flex items-center gap-2 text-slate-400">
                <Info className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Informations de base</span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Âge</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-premium" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sexe</label>
                <select name="sexe" value={formData.sexe} onChange={handleChange} className="input-premium">
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Activité</label>
                <select name="type_activite" value={formData.type_activite} onChange={handleChange} className="input-premium">
                  <option value="commerce">Commerce</option>
                  <option value="transport">Transport</option>
                  <option value="artisanat">Artisanat</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="services">Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Zone Géo</label>
                <select name="zone_geographique" value={formData.zone_geographique} onChange={handleChange} className="input-premium">
                  <option value="conakry">Conakry</option>
                  <option value="kindia">Kindia</option>
                  <option value="boke">Boké</option>
                  <option value="labe">Labé</option>
                  <option value="kankan">Kankan</option>
                  <option value="nzerekore">Nzérékoré</option>
                </select>
              </div>

              <div className="col-span-full mt-4 pb-2 border-b border-slate-100 flex items-center gap-2 text-slate-400">
                <Zap className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-semibold uppercase">Données Mobile Money</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Ancienneté (mois)</label>
                <input type="number" name="anciennete_mobile_mois" value={formData.anciennete_mobile_mois} onChange={handleChange} className="input-premium" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tx entrées (30j)</label>
                <input type="number" name="nb_tx_entrees_30j" value={formData.nb_tx_entrees_30j} onChange={handleChange} className="input-premium" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Revenu moyen (GNF)</label>
                <input type="number" name="montant_moyen_entree_gnf" value={formData.montant_moyen_entree_gnf} onChange={handleChange} className="input-premium" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Régularité (0-1)</label>
                <input type="number" step="0.01" name="regularite_remboursements" value={formData.regularite_remboursements} onChange={handleChange} className="input-premium" />
              </div>
            </div>

            <button
              type="submit"
              disabled={scoreMutation.isPending}
              className="w-full btn-primary py-3 text-base"
            >
              {scoreMutation.isPending ? 'Analyse en cours...' : 'Calculer le score'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Résultat */}
        <div className="space-y-6">
          {!result ? (
            <div className="card-premium h-[500px] flex flex-col items-center justify-center text-center p-8 border-dashed border-2">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Prêt pour l'analyse</h3>
              <p className="text-slate-400 max-w-xs">Remplissez les informations du client à gauche pour générer un score de crédit prédictif.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={clsx(
                "card-premium overflow-hidden border-t-8",
                result.decision === 'approuve' ? 'border-t-guinee-green' : 'border-t-guinee-red'
              )}>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span className={clsx(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2",
                      result.decision === 'approuve' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {result.decision === 'approuve' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      Crédit {result.decision === 'approuve' ? 'Approuvé' : 'Refusé'}
                    </span>
                    <h3 className="text-4xl font-display font-bold text-slate-900">{result.score.toFixed(1)}<span className="text-lg text-slate-400">/100</span></h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 uppercase">Risque</p>
                    <p className={clsx(
                      "font-bold capitalize",
                      result.categorie_risque === 'faible' ? 'text-guinee-green' : 
                      result.categorie_risque === 'moyen' ? 'text-guinee-yellow' : 'text-guinee-red'
                    )}>
                      {result.categorie_risque}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-8">
                  <p className="text-sm text-slate-700 italic">"{result.interpretation}"</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facteurs déterminants</h4>
                  {result.top_features.map((feature: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {feature.direction === 'positif' ? 
                          <TrendingUp className="w-4 h-4 text-guinee-green" /> : 
                          <TrendingDown className="w-4 h-4 text-guinee-red" />
                        }
                        <span className="text-sm text-slate-600">{feature.label || feature.feature}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={clsx(
                              "h-1.5 rounded-full",
                              feature.direction === 'positif' ? 'bg-guinee-green' : 'bg-guinee-red'
                            )} 
                            style={{ width: `${Math.min(feature.impact * 20, 100)}%` }} 
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-400">{feature.valeur}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {result.decision === 'approuve' && result.montant_recommande_gnf && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Montant Recommandé</p>
                    <p className="text-2xl font-bold text-guinee-green">{result.montant_recommande_gnf.toLocaleString()} GNF</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Scoring
