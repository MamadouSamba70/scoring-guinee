import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { 
  History as HistoryIcon, 
  User, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'

const History = () => {
  const token = useAuthStore(state => state.token)

  const { data: history, isLoading } = useQuery({
    queryKey: ['scoring-history'],
    queryFn: async () => {
      const res = await fetch('/api/v1/scoring/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Erreur chargement historique')
      return res.json()
    }
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-white rounded-2xl" />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Historique des Scorings</h1>
        <p className="text-slate-500">Suivez tous les calculs de risques effectués par le système</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Décision</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Agent</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900">{item.client_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 ml-5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-12 h-2 rounded-full overflow-hidden bg-slate-100"
                      )}>
                        <div 
                          className={clsx(
                            "h-full rounded-full",
                            item.score >= 70 ? "bg-guinee-green" : 
                            item.score >= 40 ? "bg-guinee-yellow" : "bg-red-500"
                          )} 
                          style={{ width: `${item.score}%` }} 
                        />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{item.score.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      item.decision === 'approuve' ? "bg-green-50 text-green-700" :
                      item.decision === 'refuse' ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {item.decision === 'approuve' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.decision}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {item.agent_name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!history || history.length === 0) && (
            <div className="p-12 text-center">
              <HistoryIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400">Aucun historique disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History
