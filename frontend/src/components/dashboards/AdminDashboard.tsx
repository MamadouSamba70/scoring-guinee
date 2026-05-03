import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { useQueryClient } from '@tanstack/react-query'

const AdminDashboard = () => {
  const token = useAuthStore(state => state.token)
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    }
  })

  const { data: pendingClients } = useQuery({
    queryKey: ['pending-clients'],
    queryFn: async () => {
      const res = await fetch('/api/v1/clients?status=en_attente', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    }
  })

  const kpis = [
    { label: 'Utilisateurs Actifs', value: stats?.total_users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'En attente de validation', value: stats?.pending_count || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Taux Approbation Global', value: '78%', icon: CheckCircle, color: 'text-guinee-green', bg: 'bg-green-100' },
    { label: 'Score Moyen Réseau', value: '62.4', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="card-premium flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Validations Prioritaires</h3>
          <div className="space-y-4">
            {pendingClients?.items?.length > 0 ? (
              pendingClients.items.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                      {c.nom_complet.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{c.nom_complet}</p>
                      <p className="text-xs text-slate-500">{c.telephone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        const res = await fetch(`/api/v1/clients/${c.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ status: 'valide' })
                        })
                        if (res.ok) {
                          queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
                          queryClient.invalidateQueries({ queryKey: ['pending-clients'] })
                          toast.success('Dossier validé')
                        }
                      }}
                      className="p-2 text-guinee-green hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={async () => {
                        const res = await fetch(`/api/v1/clients/${c.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ status: 'refuse' })
                        })
                        if (res.ok) {
                          queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
                          queryClient.invalidateQueries({ queryKey: ['pending-clients'] })
                          toast.error('Dossier refusé')
                        }
                      }}
                      className="p-2 text-guinee-red hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Aucune validation en attente</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-premium">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Activité du Réseau (Agents)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'CRG Conakry', val: 45 },
                { name: 'CRG Kindia', val: 32 },
                { name: 'CRG Labé', val: 28 },
                { name: 'CRG Kankan', val: 15 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="val" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
