import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Zap, 
  Target,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const AgentDashboard = () => {
  const token = useAuthStore(state => state.token)

  const { data: stats } = useQuery({
    queryKey: ['agent-stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    }
  })

  const kpis = [
    { label: 'Mon Portefeuille', value: stats?.total_clients || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Scorings du mois', value: stats?.scores_total || 0, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Objectif Mensuel', value: '85%', icon: Target, color: 'text-guinee-green', bg: 'bg-green-100' },
    { label: 'Délai moyen', value: '1.2j', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
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

      <div className="card-premium">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Performance des Scorings</h3>
            <p className="text-sm text-slate-500">Evolution de la qualité de votre portefeuille</p>
          </div>
          <div className="flex items-center gap-2 text-guinee-green text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4" />
            +12.5%
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { date: '01/05', score: 45 },
              { date: '05/05', score: 52 },
              { date: '10/05', score: 48 },
              { date: '15/05', score: 61 },
              { date: '20/05', score: 58 },
              { date: '25/05', score: 65 },
              { date: '30/05', score: 62 },
            ]}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AgentDashboard
