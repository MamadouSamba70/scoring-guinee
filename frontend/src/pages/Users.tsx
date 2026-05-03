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
  Eye
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

  if (isLoading) return <div className="animate-pulse h-64 bg-white rounded-xl" />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-slate-500">Administrez les accès et les rôles de votre équipe</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((u: any) => (
          <div key={u.id} className="card-premium group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700">
                {u.role === 'admin' ? <ShieldAlert className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
              </div>
              <span className={clsx(
                "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                u.role === 'admin' ? "bg-red-100 text-red-700" : 
                u.role === 'agent' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              )}>
                {u.role}
              </span>
            </div>
            
            <h3 className="font-bold text-slate-900 text-lg truncate">{u.full_name}</h3>
            <div className="space-y-1 mb-4">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {u.email || 'Pas d\'email'}
              </p>
              {u.telephone && (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {u.telephone}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Building className="w-3.5 h-3.5" />
                {u.institution || 'Non spécifié'}
              </div>
              {u.is_active ? (
                <span className="flex items-center gap-1 text-xs text-guinee-green font-semibold">
                  <Check className="w-3 h-3" /> Actif
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                  <X className="w-3 h-3" /> Inactif
                </span>
              )}
            </div>

            <button 
              onClick={() => {
                setSelectedUser(u)
                setIsDetailModalOpen(true)
              }}
              className="w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir les informations
            </button>
          </div>
        ))}
      </div>

      {/* Modal Détails Utilisateur */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Informations Utilisateur</h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700">
                  {selectedUser.role === 'admin' ? <ShieldAlert className="w-8 h-8" /> : <UserIcon className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedUser.full_name}</h3>
                  <p className="text-slate-500 capitalize">{selectedUser.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-900 break-all">{selectedUser.email || 'Non renseigné'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Téléphone</p>
                  <p className="text-sm font-medium text-slate-900">{selectedUser.telephone || 'Non renseigné'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Institution</p>
                  <p className="text-sm font-medium text-slate-900">{selectedUser.institution || 'Non spécifié'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Statut</p>
                  <p className="text-sm font-medium text-slate-900">{selectedUser.is_active ? 'Actif' : 'Inactif'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Créé le
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Dernier accès
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('fr-FR') : 'Jamais'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
                      deleteMutation.mutate(selectedUser.id)
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer le compte
                </button>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 btn-primary py-3"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvel Utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Nouvel Utilisateur</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                <input {...register('full_name')} className="input-premium" placeholder="Prénom Nom" />
                {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" {...register('email')} className="input-premium" placeholder="email@exemple.gn" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe temporaire</label>
                <input type="password" {...register('password')} className="input-premium" placeholder="••••••••" />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                  <select {...register('role')} className="input-premium">
                    <option value="agent">Agent</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
                  <input {...register('institution')} className="input-premium" placeholder="Ex: CRG" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex-1 btn-primary py-2"
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

export default Users
