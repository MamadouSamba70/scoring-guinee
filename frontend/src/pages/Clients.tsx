import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  Phone,
  MapPin,
  Briefcase,
  X,
  Check,
  CheckCircle2,
  XCircle,
  Zap,
  ChevronRight,
  User as UserIcon,
  Smartphone,
  Calendar,
  Activity,
  Users
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { clsx } from 'clsx'

const clientSchema = z.object({
  nom_complet: z.string().min(3, 'Le nom est trop court'),
  telephone: z.string().min(9, 'Numéro invalide'),
  telephone_secondaire: z.string().optional(),
  sexe: z.enum(['M', 'F']),
  age: z.number().min(18).max(80),
  zone_geographique: z.string(),
  type_activite: z.string(),
  anciennete_mobile_mois: z.number().min(0),
  nb_tx_entrees_30j: z.number().min(0),
  montant_moyen_entree_gnf: z.number().min(0),
  regularite_remboursements: z.number().min(0).max(1),
  nb_tx_diaspora_6mois: z.number().min(0),
  ratio_depense_revenu: z.number().min(0),
  solde_moyen_gnf: z.number().min(0),
  defaut_passe: z.boolean().default(false),
  notes: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

const Clients = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { token, user } = useAuthStore()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      sexe: 'M',
      zone_geographique: 'conakry',
      type_activite: 'commerce',
      age: 30,
      anciennete_mobile_mois: 12,
      nb_tx_entrees_30j: 10,
      montant_moyen_entree_gnf: 1000000,
      regularite_remboursements: 0.9,
      nb_tx_diaspora_6mois: 0,
      ratio_depense_revenu: 0.4,
      solde_moyen_gnf: 500000,
      defaut_passe: false,
    }
  })

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/v1/clients?q=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Erreur chargement clients')
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const res = await fetch('/api/v1/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Erreur lors de la création')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client ajouté avec succès')
      setIsModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const clients = clientsData?.items || []

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-white/5 border-t-guinee-green rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initialisation du réseau...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-reveal">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-guinee-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase ">Base de Données Nationale</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Portefeuille <span className="text-guinee-green">Clients</span></h1>
          <p className="text-slate-500 font-medium mt-1">Gestion et supervision des micro-entrepreneurs enregistrés.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Rechercher..." 
               className="pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 w-64 focus:ring-2 focus:ring-guinee-green/50 outline-none transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Identité du Client</th>
                <th>Localisation</th>
                <th>Activité</th>
                <th>Ancienneté</th>
                <th className="text-right">Opérations</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client: any) => (
                <tr key={client.id} className="group">
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-400 group-hover:border-guinee-green/50 transition-all">
                        {client.nom_complet.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{client.nom_complet}</p>
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-wider mt-0.5">
                          <Phone className="w-3 h-3 text-guinee-green" />
                          {client.telephone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                      <MapPin className="w-4 h-4 text-slate-600" />
                      {client.zone_geographique}
                    </div>
                  </td>
                  <td>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <Briefcase className="w-3 h-3 text-guinee-green" />
                      {client.type_activite}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                       {client.anciennete_mobile_mois} MOIS
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-3">
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => navigate('/app/scoring', { state: { client: client } })}
                          className="w-10 h-10 bg-guinee-green/10 text-guinee-green hover:bg-guinee-green hover:text-white rounded-xl transition-all flex items-center justify-center shadow-lg"
                        >
                          <Zap className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                          if (window.confirm('Supprimer ce client ?')) {
                            const res = await fetch(`/api/v1/clients/${client.id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            })
                            if (res.ok) {
                              queryClient.invalidateQueries({ queryKey: ['clients'] })
                              toast.success('Client supprimé')
                            }
                          }
                        }}
                        className="w-10 h-10 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-600">
                          <Users className="w-10 h-10" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aucun client enregistré dans le réseau.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouveau Client - Premium Redesign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/40 animate-in fade-in duration-300">
          <div className="dark-glass rounded-[3rem] shadow-4xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Nouveau Dossier</h2>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Enregistrement client certifié</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-red-400/10 hover:text-red-400 rounded-xl transition-all flex items-center justify-center text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Section 1 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                   <UserIcon className="w-4 h-4 text-guinee-green" />
                   <span className="text-xs font-bold text-white uppercase ">Identité & Profil</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-white transition-colors">Nom Complet</label>
                    <input {...register('nom_complet')} className="input-premium py-3.5" placeholder="Mamadou Diallo" />
                    {errors.nom_complet && <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wide">{errors.nom_complet.message}</p>}
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-white transition-colors">Téléphone Principal</label>
                    <input {...register('telephone')} className="input-premium py-3.5" placeholder="622 00 00 00" />
                    {errors.telephone && <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wide">{errors.telephone.message}</p>}
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Genre</label>
                    <select {...register('sexe')} className="input-premium py-3.5">
                      <option value="M" className="bg-slate-900 text-white">Homme</option>
                      <option value="F" className="bg-slate-900 text-white">Femme</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Âge Réel</label>
                    <input type="number" {...register('age', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Zone Géographique</label>
                    <select {...register('zone_geographique')} className="input-premium py-3.5">
                      <option value="conakry" className="bg-slate-900 text-white">Conakry</option>
                      <option value="kindia" className="bg-slate-900 text-white">Kindia</option>
                      <option value="boke" className="bg-slate-900 text-white">Boké</option>
                      <option value="labe" className="bg-slate-900 text-white">Labé</option>
                      <option value="mamou" className="bg-slate-900 text-white">Mamou</option>
                      <option value="faranah" className="bg-slate-900 text-white">Faranah</option>
                      <option value="kankan" className="bg-slate-900 text-white">Kankan</option>
                      <option value="nzerekore" className="bg-slate-900 text-white">Nzérékoré</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Secteur d'Activité</label>
                    <select {...register('type_activite')} className="input-premium py-3.5">
                      <option value="commerce" className="bg-slate-900 text-white">Commerce</option>
                      <option value="transport" className="bg-slate-900 text-white">Transport</option>
                      <option value="artisanat" className="bg-slate-900 text-white">Artisanat</option>
                      <option value="agriculture" className="bg-slate-900 text-white">Agriculture</option>
                      <option value="services" className="bg-slate-900 text-white">Services</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                   <Smartphone className="w-4 h-4 text-guinee-yellow" />
                   <span className="text-xs font-bold text-white uppercase ">Métriques Financières Mobile</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Ancienneté (mois)</label>
                    <input type="number" {...register('anciennete_mobile_mois', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Flux Mensuel (GNF)</label>
                    <input type="number" {...register('montant_moyen_entree_gnf', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nb. Transactions (30j)</label>
                    <input type="number" {...register('nb_tx_entrees_30j', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Solde Moyen (GNF)</label>
                    <input type="number" {...register('solde_moyen_gnf', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Régularité Rembours. (0-1)</label>
                    <input type="number" step="0.01" {...register('regularite_remboursements', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Ratio Dépense/Revenu</label>
                    <input type="number" step="0.01" {...register('ratio_depense_revenu', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tx Diaspora (6 mois)</label>
                    <input type="number" {...register('nb_tx_diaspora_6mois', { valueAsNumber: true })} className="input-premium py-3.5" />
                  </div>
                  <div className="group flex flex-col justify-end">
                    <label className="flex items-center gap-3 cursor-pointer py-3.5 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                      <input type="checkbox" {...register('defaut_passe')} className="w-5 h-5 rounded border-white/20 bg-slate-900 text-guinee-green focus:ring-guinee-green" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Défaut de paiement passé</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="flex gap-4 pt-6 border-t border-white/5 pb-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-slate-400 uppercase hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex-1 px-6 py-4 bg-white text-slate-950 rounded-2xl text-xs font-bold uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? 'En cours...' : 'Finaliser le Dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clients
