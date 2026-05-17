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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-white/5 border-t-guinee-green rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chargement des agents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-reveal pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Réseau Opérationnel</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Gestion des <span className="text-blue-500">Agents</span></h1>
          <p className="text-slate-500 font-medium mt-1">Supervisez votre équipe d'agents de terrain.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl uppercase tracking-wider"
        >
          <UserPlus className="w-4 h-4" />
          Nouvel Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents?.map((agent: any) => (
          <div key={agent.id} className="dark-glass p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <Contact className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight mb-1">{agent.full_name}</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20">
                    Agent Terrain
                  </span>
                </div>
              </div>
              
              {user?.role === 'admin' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Voulez-vous vraiment révoquer l'accès de ${agent.full_name} ?`)) {
                      deleteMutation.mutate(agent.id)
                    }
                  }}
                  className="p-2.5 bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-all border border-transparent z-10 group/btn"
                  title="Révoquer l'accès"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="space-y-2.5 mb-6 relative z-10">
              <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300 truncate">{agent.email}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300 truncate">{agent.institution}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Guinée / Conakry</span>
              </div>
            </div>

            <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Clients: <span className="text-white ml-1">12</span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Précision: <span className="text-guinee-green ml-1">94%</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-guinee-green font-bold uppercase tracking-wider bg-guinee-green/10 px-2 py-1 rounded border border-guinee-green/20">
                <ShieldCheck className="w-3 h-3" />
                Vérifié
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nouvel Agent */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-4xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-300">
                   <UserPlus className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase">Nouvel Agent</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Créez les accès terrain</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="p-6 md:p-8 space-y-5">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nom complet</label>
                <input {...register('full_name')} className="input-premium py-3.5" placeholder="Prénom Nom" />
                {errors.full_name && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide ml-1">{errors.full_name.message}</p>}
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email professionnel</label>
                <input type="email" {...register('email')} className="input-premium py-3.5" placeholder="agent@crg-guinee.gn" />
                {errors.email && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide ml-1">{errors.email.message}</p>}
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Mot de passe provisoire</label>
                <input type="password" {...register('password')} className="input-premium py-3.5" placeholder="••••••••" />
                {errors.password && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide ml-1">{errors.password.message}</p>}
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Institution</label>
                <select {...register('institution')} className="input-premium py-3.5">
                  <option value="Crédit Rural de Guinée" className="bg-slate-900 text-white">Crédit Rural de Guinée (CRG)</option>
                  <option value="COFINA Guinée" className="bg-slate-900 text-white">COFINA Guinée</option>
                  <option value="YETE MALI" className="bg-slate-900 text-white">YETE MALI</option>
                  <option value="FINADEV Guinée" className="bg-slate-900 text-white">FINADEV Guinée</option>
                  <option value="Société Générale Guinée" className="bg-slate-900 text-white">Société Générale Guinée (SGG)</option>
                  <option value="Ecobank Guinée" className="bg-slate-900 text-white">Ecobank Guinée</option>
                  <option value="BICIGUI" className="bg-slate-900 text-white">BICIGUI</option>
                  <option value="UBA Guinée" className="bg-slate-900 text-white">UBA Guinée</option>
                  <option value="Autre" className="bg-slate-900 text-white">Autre Institution</option>
                </select>
                {errors.institution && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide ml-1">{errors.institution.message}</p>}
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-4 border border-white/10 bg-white/5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-wider"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-4 bg-white text-slate-950 rounded-2xl text-xs font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-wider"
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
