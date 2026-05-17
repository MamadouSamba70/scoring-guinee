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
  TrendingDown,
  Activity,
  ShieldCheck,
  ChevronRight,
  Database
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
    <div className="space-y-10 animate-reveal pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-guinee-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase ">Moteur d'Analyse Prédictive</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Analyse de <span className="text-guinee-green">Solvabilité</span></h1>
          <p className="text-slate-500 font-medium mt-1">Évaluation multidimensionnelle basée sur 12 variables comportementales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
        {/* Formulaire */}
        <div className="dark-glass rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <Info className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-white uppercase ">Variables Socio-Démographiques</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Âge</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-premium py-3" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Genre</label>
                  <select name="sexe" value={formData.sexe} onChange={handleChange} className="input-premium py-3">
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Secteur d'Activité</label>
                  <select name="type_activite" value={formData.type_activite} onChange={handleChange} className="input-premium py-3">
                    <option value="commerce">Commerce</option>
                    <option value="transport">Transport</option>
                    <option value="artisanat">Artisanat</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="services">Services</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Zone Géo</label>
                  <select name="zone_geographique" value={formData.zone_geographique} onChange={handleChange} className="input-premium py-3">
                    <option value="conakry">Conakry</option>
                    <option value="kindia">Kindia</option>
                    <option value="boke">Boké</option>
                    <option value="labe">Labé</option>
                    <option value="kankan">Kankan</option>
                    <option value="nzerekore">Nzérékoré</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-white/5 pt-4">
                <Zap className="w-4 h-4 text-guinee-green" />
                <span className="text-xs font-bold text-white uppercase ">Métriques Mobile Money</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Ancienneté (mois)</label>
                  <input type="number" name="anciennete_mobile_mois" value={formData.anciennete_mobile_mois} onChange={handleChange} className="input-premium py-3" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Fréquence Tx (30j)</label>
                  <input type="number" name="nb_tx_entrees_30j" value={formData.nb_tx_entrees_30j} onChange={handleChange} className="input-premium py-3" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Flux Moyen (GNF)</label>
                  <input type="number" name="montant_moyen_entree_gnf" value={formData.montant_moyen_entree_gnf} onChange={handleChange} className="input-premium py-3" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Régularité (0-1)</label>
                  <input type="number" step="0.01" name="regularite_remboursements" value={formData.regularite_remboursements} onChange={handleChange} className="input-premium py-3" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={scoreMutation.isPending}
              className="w-full bg-white text-slate-950 py-5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center group"
            >
              {scoreMutation.isPending ? 'Analyse Neuronale en cours...' : 'Lancer le Scoring'}
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Résultat */}
        <div className="space-y-8">
          {!result ? (
            <div className="dark-glass h-[600px] rounded-[3rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-white/10 group">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 group-hover:border-guinee-green/30 transition-all">
                <Activity className="w-12 h-12 text-slate-700 group-hover:text-guinee-green transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight uppercase mb-4">Moteur en Veille</h3>
              <p className="text-slate-500 font-medium max-w-xs leading-relaxed">Prêt pour l'analyse prédictive. Remplissez les paramètres client pour générer le score certifié.</p>
            </div>
          ) : (
            <div className="animate-reveal">
              <div className={clsx(
                "dark-glass rounded-[3rem] p-10 md:p-12 border border-white/10 shadow-4xl relative overflow-hidden",
                result.decision === 'approuve' ? 'after:content-[""] after:absolute after:top-0 after:left-0 after:w-full after:h-2 after:bg-guinee-green' : 'after:content-[""] after:absolute after:top-0 after:left-0 after:w-full after:h-2 after:bg-guinee-red'
              )}>
                <div className="flex items-start justify-between mb-10 pb-6 border-b border-white/5">
                  <div>
                    <div className={clsx(
                      "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border",
                      result.decision === 'approuve' ? 'bg-guinee-green/10 text-guinee-green border-guinee-green/20' : 'bg-guinee-red/10 text-guinee-red border-guinee-red/20'
                    )}>
                      {result.decision === 'approuve' ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <XCircle className="w-3 h-3 mr-2" />}
                      {result.decision === 'approuve' ? 'Crédit Approuvé' : 'Analyse Défavorable'}
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-6xl font-bold text-white tracking-tight">{result.score.toFixed(1)}</span>
                       <span className="text-lg font-bold text-slate-600">/100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Classe de Risque</p>
                    <p className={clsx(
                      "text-xl font-bold uppercase tracking-tight",
                      result.categorie_risque === 'faible' ? 'text-guinee-green' : 
                      result.categorie_risque === 'moyen' ? 'text-guinee-yellow' : 'text-guinee-red'
                    )}>
                      {result.categorie_risque}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 mb-10 italic text-slate-300 text-sm font-medium leading-relaxed">
                  "{result.interpretation}"
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Vecteurs d'Influence</h4>
                  {result.top_features.map((feature: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          feature.direction === 'positif' ? 'bg-guinee-green/10 text-guinee-green' : 'bg-guinee-red/10 text-guinee-red'
                        )}>
                          {feature.direction === 'positif' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{feature.label || feature.feature}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={clsx(
                              "h-full rounded-full transition-all duration-1000",
                              feature.direction === 'positif' ? 'bg-guinee-green shadow-[0_0_8px_rgba(0,148,96,0.3)]' : 'bg-guinee-red shadow-[0_0_8px_rgba(206,17,38,0.3)]'
                            )} 
                            style={{ width: `${Math.min(feature.impact * 20, 100)}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 w-16 text-right tracking-wider">{feature.valeur}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {result.decision === 'approuve' && result.montant_recommande_gnf && (
                  <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Capacité de Financement</p>
                       <p className="text-3xl font-bold text-guinee-green tracking-tight">{result.montant_recommande_gnf.toLocaleString()} <span className="text-sm">GNF</span></p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <ShieldCheck className="w-8 h-8 text-guinee-green" />
                    </div>
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
