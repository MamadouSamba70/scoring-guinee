import { useAuthStore } from '../store/authStore'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import AgentDashboard from '../components/dashboards/AgentDashboard'
import ClientDashboard from '../components/dashboards/ClientDashboard'

const Dashboard = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            {user?.role === 'admin' ? 'Direction Générale' : 
             user?.role === 'client' ? 'Mon Espace Client' : 'Mon Portefeuille Agent'}
          </h1>
          <p className="text-slate-500">
            {user?.role === 'admin' ? 'Vue d\'ensemble du réseau de scoring' : 
             user?.role === 'client' ? 'Suivi de mon dossier de crédit' : 'Suivi de vos dossiers micro-entrepreneurs'}
          </p>
        </div>
      </div>

      {user?.role === 'admin' && <AdminDashboard />}
      {user?.role === 'agent' && <AgentDashboard />}
      {user?.role === 'client' && <ClientDashboard />}
    </div>
  )
}

export default Dashboard
