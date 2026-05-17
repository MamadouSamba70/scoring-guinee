import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Shield, 
  UserPlus, 
  Mail, 
  User as UserIcon,
  X,
  Check,
  MoreVertical,
  ShieldAlert,
  Building,
  Phone,
  Calendar,
  Clock,
  Trash2,
  Eye,
  ShieldCheck,
  Activity
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { clsx } from 'clsx'

const userSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  full_name: z.string().min(3, 'Le nom est trop court'),
  role: z.enum(['admin', 'agent', 'viewer']),
  institution: z.string().optional(),
})

type UserFormValues = z.infer<typeof userSchema>

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const token = useAuthStore(state => state.token)
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'agent',
      institution: 'Crédit Rural de Guinée'
    }
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/v1/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Erreur chargement utilisateurs')
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const res = await fetch('/api/v1/users', {
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Utilisateur créé avec succès')
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
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Utilisateur supprimé')
      setIsDetailModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-white/5 border-t-guinee-green rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chargement des accréditations...</p>
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Centre de Contrôle</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Réseau des <span className="text-blue-500">Agents</span></h1>
          <p className="text-slate-500 font-medium mt-1">Supervision des accréditations et des rôles système.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-wider"
        >
          <UserPlus className="w-4 h-4" />
          Accréditer un Membre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users?.map((u: any) => (
          <div key={u.id} className="dark-glass p-5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group flex flex-col relative overflow-hidden">
            {/* Soft background glow based on role */}
            <div className={clsx(
               "absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 pointer-events-none rounded-full",
               u.role === 'admin' ? "bg-red-500" : 
               u.role === 'agent' ? "bg-green-500" : "bg-blue-500"
            )} />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                   {u.role === 'admin' ? <ShieldAlert className="w-5 h-5 text-red-400" /> : <UserIcon className="w-5 h-5" />}
                 </div>
                 <div>
                    <h3 className="font-bold text-white text-base truncate">{u.full_name}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Building className="w-3 h-3" />
                      {u.institution || 'HQ'}
                    </p>
                 </div>
              </div>
              <span className={clsx(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                u.role === 'admin' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                u.role === 'agent' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              )}>
                {u.role}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 mb-6 relative z-10">
              <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-300 truncate">{u.email || 'Pas d\'email'}</span>
              </div>
              {u.telephone && (
                <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-300">{u.telephone}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
              {u.is_active ? (
                <span className="flex items-center gap-1.5 text-[10px] text-guinee-green font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-guinee-green rounded-full animate-pulse" /> Actif
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <X className="w-3 h-3" /> Inactif
                </span>
              )}
              
              <button 
                onClick={() => {
                  setSelectedUser(u)
                  setIsDetailModalOpen(true)
                }}
                className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors border border-white/5 hover:border-white/10 group/btn"
                title="Dossier Agent"
              >
                <Eye className="w-4 h-4 group-hover/btn:text-white transition-colors" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Détails Utilisateur */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-4xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                 <h2 className="text-xl font-bold text-white tracking-tight uppercase">Dossier Accréditation</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Matricule: {selectedUser.id.toString().padStart(6, '0')}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shadow-xl">
                  {selectedUser.role === 'admin' ? <ShieldAlert className="w-10 h-10 text-red-400" /> : <ShieldCheck className="w-10 h-10 text-guinee-green" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{selectedUser.full_name}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <Activity className="w-3 h-3" />
                     Niveau : {selectedUser.role}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</p>
                  <p className="text-sm font-semibold text-white break-all">{selectedUser.email || 'Non renseigné'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Téléphone</p>
                  <p className="text-sm font-semibold text-white">{selectedUser.telephone || 'Non renseigné'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5"><Building className="w-3 h-3" /> Affectation</p>
                  <p className="text-sm font-semibold text-white">{selectedUser.institution || 'Non spécifié'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Enrôlement
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="sm:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Dernier accès réseau
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('fr-FR') : 'Connexion vierge'}
                    </p>
                  </div>
                  <div className={clsx(
                     "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                     selectedUser.is_active ? "bg-guinee-green/10 text-guinee-green border-guinee-green/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  )}>
                     {selectedUser.is_active ? 'Statut Opérationnel' : 'Accès Suspendu'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white uppercase tracking-wider transition-all"
                >
                  Fermer
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Révocation définitive des accès. Continuer ?')) {
                      deleteMutation.mutate(selectedUser.id)
                    }
                  }}
                  className="flex-1 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Révoquer Accès
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvel Utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-4xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                 <h2 className="text-xl font-bold text-white tracking-tight uppercase">Nouvelle Accréditation</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Création de profil opérateur</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="p-6 md:p-8 space-y-6">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Identité Officielle</label>
                <input {...register('full_name')} className="input-premium py-3.5" placeholder="Prénom Nom" />
                {errors.full_name && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.full_name.message}</p>}
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Contact Email</label>
                <input type="email" {...register('email')} className="input-premium py-3.5" placeholder="agent@scoring-guinee.gn" />
                {errors.email && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.email.message}</p>}
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Code de Sécurité initial</label>
                <input type="password" {...register('password')} className="input-premium py-3.5" placeholder="••••••••" />
                {errors.password && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Niveau d'Accès</label>
                  <select {...register('role')} className="input-premium py-3.5">
                    <option value="agent" className="bg-slate-900 text-white">Agent Terrain</option>
                    <option value="viewer" className="bg-slate-900 text-white">Auditeur</option>
                    <option value="admin" className="bg-slate-900 text-white">Administrateur</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Affectation</label>
                  <input {...register('institution')} className="input-premium py-3.5" placeholder="Ex: CRG Conakry" />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/5">
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
                  {createMutation.isPending ? 'Création...' : 'Générer Accès'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
