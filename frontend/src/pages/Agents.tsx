import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Contact, 
  UserPlus, 
  Mail, 
  X,
  Check,
  Building,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Trash2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { clsx } from 'clsx'

const agentSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  full_name: z.string().min(3, 'Le nom est trop court'),
  institution: z.string().min(2, 'Institution requise'),
  zone: z.string().optional(),
})

type AgentFormValues = z.infer<typeof agentSchema>

const Agents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { token, user } = useAuthStore()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      institution: 'Crédit Rural de Guinée',
      zone: 'Conakry'
    }
  })

  // On récupère tous les utilisateurs et on filtre par rôle 'agent'
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await fetch('/api/v1/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Erreur chargement agents')
      const allUsers = await res.json()
      return allUsers.filter((u: any) => u.role === 'agent')
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormValues) => {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, role: 'agent' })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Erreur lors de la création')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Compte Agent créé avec succès')
      setIsModalOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Erreur lors de la suppression')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent supprimé')
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-white rounded-xl" />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Gestion des Agents</h1>
          <p className="text-slate-500">Supervisez votre équipe d'agents de terrain</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Nouvel Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.map((agent: any) => (
          <div key={agent.id} className="card-premium group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Contact className="w-20 h-20" />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 shadow-inner">
                <Contact className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-none mb-1">{agent.full_name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                   Agent Terrain
                </span>
              </div>
              {user?.role === 'admin' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Voulez-vous vraiment supprimer l'agent ${agent.full_name} ?`)) {
                      deleteMutation.mutate(agent.id)
                    }
                  }}
                  className="absolute top-3 right-3 p-2 bg-white text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-lg border border-red-100 z-10"
                  title="Supprimer l'agent"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {agent.email}
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                {agent.institution}
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Guinée / Conakry
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="text-slate-400">
                  Clients: <span className="text-slate-900">12</span>
                </div>
                <div className="text-slate-400">
                  Précision: <span className="text-guinee-green">94%</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-guinee-green font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Vérifié
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nouvel Agent */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 bg-slate-900 text-white relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-white/50" />
              </button>
              <div className="p-3 bg-primary-600 rounded-2xl w-fit mb-4 shadow-lg shadow-primary-600/30">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Ajouter un Agent</h2>
              <p className="text-slate-400 text-sm">Créez les accès pour votre équipe terrain</p>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom complet</label>
                <input {...register('full_name')} className="input-premium" placeholder="Prénom Nom" />
                {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email professionnel</label>
                <input type="email" {...register('email')} className="input-premium" placeholder="agent@crg-guinee.gn" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe provisoire</label>
                <input type="password" {...register('password')} className="input-premium" placeholder="••••••••" />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Institution</label>
                <select {...register('institution')} className="input-premium appearance-none bg-white">
                  <option value="Crédit Rural de Guinée">Crédit Rural de Guinée (CRG)</option>
                  <option value="COFINA Guinée">COFINA Guinée</option>
                  <option value="YETE MALI">YETE MALI</option>
                  <option value="FINADEV Guinée">FINADEV Guinée</option>
                  <option value="Société Générale Guinée">Société Générale Guinée (SGG)</option>
                  <option value="Ecobank Guinée">Ecobank Guinée</option>
                  <option value="BICIGUI">BICIGUI</option>
                  <option value="UBA Guinée">UBA Guinée</option>
                  <option value="Autre">Autre Institution</option>
                </select>
                {errors.institution && <p className="mt-1 text-xs text-red-500">{errors.institution.message}</p>}
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex-1 btn-primary py-3"
                >
                  {createMutation.isPending ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agents
