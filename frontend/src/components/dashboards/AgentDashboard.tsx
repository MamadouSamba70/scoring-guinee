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
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Erreur chargement stats')
      }
      return data
    }
  })

  const kpis = [
    { label: 'Mon Portefeuille', value: stats?.total_clients || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Inscriptions (30j)', value: stats?.total_clients || 0, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Objectif Recrutement', value: '85%', icon: Target, color: 'text-guinee-green', bg: 'bg-guinee-green/10' },
    { label: 'Délai Enregistrement', value: '1.2j', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="dark-glass p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all">
            <div className={`p-4 rounded-2xl ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dark-glass p-8 rounded-3xl border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-white">Activité d'Enregistrement</h3>
            <p className="text-sm text-slate-500">Evolution des nouvelles inscriptions de clients</p>
          </div>
          <div className="flex items-center gap-2 text-guinee-green text-xs font-bold bg-guinee-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            +12.5% de croissance
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { date: '01/05', count: 0 },
              { date: '05/05', count: 1 },
              { date: '10/05', count: 1 },
              { date: '15/05', count: 2 },
              { date: '20/05', count: 2 },
              { date: '25/05', count: 2 },
              { date: '30/05', count: 2 },
            ]}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#009460" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#009460" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" />
              <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
              <Area type="monotone" dataKey="count" name="Nouveaux Clients" stroke="#009460" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AgentDashboard
