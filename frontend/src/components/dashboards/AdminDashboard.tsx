import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { 
  Users, 
  Clock, 
  Zap, 
  Activity, 
  TrendingUp, 
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Search
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { clsx } from 'clsx'

const COLORS = ['#009460', 'rgba(255, 255, 255, 0.05)']

const AdminDashboard = () => {
  const token = useAuthStore(state => state.token)

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
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

  const { data: recentScores } = useQuery({
    queryKey: ['recent-scores'],
    queryFn: async () => {
      const res = await fetch('/api/v1/scoring/history?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Erreur chargement historiques')
      }
      return data || []
    }
  })

  const kpis = [
    { label: 'Clients Totaux', value: stats?.total_clients || 0, icon: Users, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    { label: 'Utilisateurs Système', value: stats?.total_users || 0, icon: ShieldCheck, color: 'text-amber-400', glow: 'shadow-amber-500/20' },
    { label: 'Scorings (Total)', value: stats?.scores_total || 0, icon: Zap, color: 'text-guinee-green', glow: 'shadow-guinee-green/20' },
    { label: 'Score Moyen', value: stats?.score_moyen || 0, icon: Activity, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
  ]

  return (
    <div className="space-y-10 animate-reveal pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-guinee-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase ">Système de Scoring Temps Réel</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Direction <span className="text-guinee-green">Générale</span></h1>
          <p className="text-slate-500 font-medium mt-1">Supervision analytique du réseau national de crédit.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
             <Search className="w-4 h-4 text-slate-500" />
             <input type="text" placeholder="Rechercher un dossier..." className="bg-transparent border-none focus:ring-0 text-xs text-white placeholder-slate-600 w-48" />
          </div>
          <button className="p-3 bg-white text-slate-950 rounded-xl font-bold hover:scale-105 transition-all shadow-xl">
             <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="dark-glass p-6 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-white/20 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <kpi.icon className="w-20 h-20" />
              </div>
              <div className={clsx("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform shadow-xl", kpi.glow)}>
                <kpi.icon className={clsx("w-6 h-6", kpi.color)} />
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight mb-1">{kpi.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dark-glass p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-guinee-green/5 to-transparent pointer-events-none" />
          <div className="z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Taux d'Approbation</p>
            <p className="text-4xl font-bold text-white tracking-tight">78.4%</p>
            <div className="flex items-center gap-2 text-guinee-green text-xs font-bold mt-3 px-2 py-1 bg-guinee-green/10 rounded-full w-fit">
              <TrendingUp className="w-3 h-3" />
              +2.1% CE MOIS
            </div>
          </div>
          <div className="w-24 h-24 relative">
             <div className="absolute inset-0 bg-guinee-green/20 rounded-full blur-2xl animate-pulse" />
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={[{v: 78}, {v: 22}]} innerRadius={30} outerRadius={42} paddingAngle={8} dataKey="v" stroke="none">
                   <Cell fill="#009460" />
                   <Cell fill="rgba(255,255,255,0.05)" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Validations Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-bold text-white text-lg flex items-center gap-3 uppercase tracking-tight">
                <Zap className="w-6 h-6 text-guinee-yellow" />
                Derniers Scores Générés
              </h3>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-guinee-green/10 text-guinee-green text-xs font-bold rounded-full border border-guinee-green/20 uppercase tracking-wider">
                <Activity className="w-3 h-3" />
                TEMPS RÉEL
              </div>
            </div>
            
            <div className="divide-y divide-white/5">
              {recentScores?.map((score: any) => (
                <div key={score.id} className="p-6 flex items-center justify-between hover:bg-white/[0.03] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center font-bold text-slate-300 group-hover:border-guinee-yellow/50 transition-colors shadow-lg">
                      <span className="text-xl text-white">{Math.round(score.score)}</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white tracking-tight mb-1">{score.client_name}</p>
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border border-white/5">
                           <ShieldCheck className="w-3 h-3 text-guinee-yellow" /> {score.decision === 'Approuvé' ? 'ÉLIGIBLE' : 'REFUSÉ'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                           <Users className="w-3 h-3" /> Agent: {score.agent_name || 'Inconnu'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-xs font-bold text-slate-500 uppercase">{new Date(score.created_at).toLocaleDateString()}</span>
                     <span className="text-[10px] text-slate-600 font-bold uppercase">{new Date(score.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
              {(!recentScores || recentScores.length === 0) && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                      <Zap className="w-10 h-10" />
                   </div>
                   <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Aucun score généré récemment.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
               <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase flex items-center gap-2 mx-auto">
                  Voir tout l'historique <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>

        {/* Network Performance Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="dark-glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-guinee-green/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-guinee-green/10 transition-colors" />
            <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-3 uppercase tracking-tight relative z-10">
              <BarChart3 className="w-6 h-6 text-guinee-green" />
              Impact Régional
            </h3>
            
            <div className="h-[300px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Conakry', val: 45 },
                  { name: 'Kindia', val: 32 },
                  { name: 'Labé', val: 28 },
                  { name: 'Kankan', val: 15 },
                ]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" tick={{fontWeight: 700}} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" tick={{fontWeight: 700}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    contentStyle={{backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}
                  />
                  <Bar dataKey="val" fill="url(#colorVal)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009460" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#009460" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-4 relative z-10">
               {[
                 { label: "Performance Conakry", val: "High", col: "text-guinee-green" },
                 { label: "Croissance Kindia", val: "+14%", col: "text-emerald-400" },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                   <span className={clsx("text-xs font-bold uppercase tracking-wider", item.col)}>{item.val}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-guinee-red/20 via-guinee-yellow/10 to-guinee-green/20 border border-white/10 shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <ShieldCheck className="w-10 h-10 text-white mb-4 animate-glow" />
                <h4 className="text-xl font-bold text-white tracking-tight mb-2 uppercase">Souveraineté Totale</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Le système de scoring est opéré sous le contrôle strict des directives nationales.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard
