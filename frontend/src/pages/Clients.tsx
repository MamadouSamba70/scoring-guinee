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
  Zap
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
    return <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-slate-200 rounded" />
      <div className="h-64 bg-white rounded-xl" />
    </div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Portefeuille Clients</h1>
          <p className="text-slate-500">Gérez les micro-entrepreneurs enregistrés</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Nouveau Client
        </button>
      </div>

      <div className="card-premium p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un nom, téléphone..." 
              className="input-premium pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Localisation</th>
                <th className="px-6 py-4 font-semibold">Activité</th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-4 font-semibold">Agent Créateur</th>
                )}
                <th className="px-6 py-4 font-semibold">Ancienneté</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {client.nom_complet.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{client.nom_complet}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.telephone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="capitalize">{client.zone_geographique}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="capitalize">{client.type_activite}</span>
                    </div>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {client.agent_name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{client.agent_name || 'Inconnu'}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        client.status === 'valide' ? "bg-green-100 text-green-700" : 
                        client.status === 'refuse' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {client.status?.replace('_', ' ')}
                      </span>
                      {user?.role === 'admin' && client.status === 'en_attente' && (
                        <div className="flex gap-1 ml-2">
                          <button 
                            onClick={async () => {
                              const res = await fetch(`/api/v1/clients/${client.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ status: 'valide' })
                              })
                              if (res.ok) {
                                queryClient.invalidateQueries({ queryKey: ['clients'] })
                                toast.success('Dossier validé')
                              }
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Valider"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              const res = await fetch(`/api/v1/clients/${client.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ status: 'refuse' })
                              })
                              if (res.ok) {
                                queryClient.invalidateQueries({ queryKey: ['clients'] })
                                toast.error('Dossier refusé')
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Refuser"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate('/app/scoring', { state: { client: client } })}
                        className="p-2 text-indigo-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
                        title="Lancer le Scoring"
                      >
                        <Zap className="w-5 h-5" />
                      </button>
                      {token && user?.role === 'admin' && (
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
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouveau Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Enregistrer un nouveau client</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full font-semibold text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">
                  Informations Personnelles
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                  <input {...register('nom_complet')} className="input-premium" placeholder="Ex: Mamadou Diallo" />
                  {errors.nom_complet && <p className="mt-1 text-xs text-red-500">{errors.nom_complet.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone Principal (Orange/MTN)</label>
                  <input {...register('telephone')} className="input-premium" placeholder="Ex: 622 00 00 00" />
                  {errors.telephone && <p className="mt-1 text-xs text-red-500">{errors.telephone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone Secondaire (Optionnel)</label>
                  <input {...register('telephone_secondaire')} className="input-premium" placeholder="Ex: 664 00 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
                  <select {...register('sexe')} className="input-premium">
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Âge</label>
                  <input type="number" {...register('age', { valueAsNumber: true })} className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zone Géographique</label>
                  <select {...register('zone_geographique')} className="input-premium">
                    <option value="conakry">Conakry</option>
                    <option value="kindia">Kindia</option>
                    <option value="boke">Boké</option>
                    <option value="labe">Labé</option>
                    <option value="mamou">Mamou</option>
                    <option value="faranah">Faranah</option>
                    <option value="kankan">Kankan</option>
                    <option value="nzerekore">Nzérékoré</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type d'Activité</label>
                  <select {...register('type_activite')} className="input-premium">
                    <option value="commerce">Commerce</option>
                    <option value="transport">Transport</option>
                    <option value="artisanat">Artisanat</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="services">Services</option>
                  </select>
                </div>

                <div className="col-span-full font-semibold text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100 pb-2 mt-4">
                  Données Mobile Money (Orange/MTN)
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ancienneté Mobile (mois)</label>
                  <input type="number" {...register('anciennete_mobile_mois', { valueAsNumber: true })} className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transactions Entrantes (30j)</label>
                  <input type="number" {...register('nb_tx_entrees_30j', { valueAsNumber: true })} className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Revenu Moyen Mensuel (GNF)</label>
                  <input type="number" {...register('montant_moyen_entree_gnf', { valueAsNumber: true })} className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Régularité Remboursements (0-1)</label>
                  <input type="number" step="0.01" {...register('regularite_remboursements', { valueAsNumber: true })} className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transactions Diaspora (6 mois)</label>
                  <input type="number" {...register('nb_tx_diaspora_6mois', { valueAsNumber: true })} className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Solde Moyen Mobile (GNF)</label>
                  <input type="number" {...register('solde_moyen_gnf', { valueAsNumber: true })} className="input-premium" />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex-1 btn-primary py-2"
                >
                  {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer le client'}
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
