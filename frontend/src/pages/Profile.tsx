import React from 'react'
import { useAuthStore } from '../store/authStore'
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  Users, 
  Target, 
  Clock,
  MapPin,
  TrendingUp,
  Zap,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { clsx } from 'clsx'

const Profile = () => {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Clients Gérés', value: '24', icon: Users, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
    { label: 'Scorings Effectués', value: '18', icon: Target, color: 'text-guinee-yellow', glow: 'shadow-guinee-yellow/20' },
    { label: 'Taux de Validation', value: '85%', icon: TrendingUp, color: 'text-guinee-green', glow: 'shadow-guinee-green/20' },
    { label: 'Heures de Service', value: '124h', icon: Clock, color: 'text-red-400', glow: 'shadow-red-500/20' },
  ]

  const infoFields = [
    { label: 'Email Professionnel', value: user?.email, icon: Mail },
    { label: 'Téléphone', value: user?.telephone || '+224 000 000 000', icon: Phone },
    { label: 'Institution / Agence', value: user?.institution || 'Scoring-Guinée HQ', icon: Building2 },
    { label: 'Membre depuis', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Mai 2024', icon: Calendar },
    { label: 'Région d\'Affectation', value: 'Conakry, Guinée', icon: MapPin },
    { label: 'Statut du Compte', value: user?.is_active ? 'Actif / Certifié' : 'Inactif', icon: ShieldCheck, isBadge: true },
  ]

  return (
    <div className="space-y-10 animate-reveal pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-guinee-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase ">Profil Utilisateur Accrédité</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Mon <span className="text-guinee-green">Espace</span></h1>
          <p className="text-slate-500 font-medium mt-1">Gérez vos accréditations et suivez vos indicateurs de performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Identité / Carte Pro */}
        <div className="lg:col-span-1 space-y-8">
          <div className="dark-glass rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden relative group">
            {/* Bannière Déco */}
            <div className="h-32 bg-gradient-to-br from-guinee-green/20 via-guinee-yellow/10 to-guinee-red/20 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('/premium-bg.png')] bg-cover opacity-20 mix-blend-overlay" />
            </div>
            
            <div className="px-8 pb-10 relative">
              <div className="relative -mt-16 mb-8 flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] shadow-4xl p-2 border border-white/10 relative">
                  <div className="w-full h-full bg-white/5 rounded-[2rem] flex items-center justify-center text-white text-4xl font-bold border border-white/10">
                    {user?.full_name?.charAt(0)}
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-guinee-green border-4 border-slate-950 rounded-full shadow-[0_0_15px_#009460]"></div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">{user?.full_name}</h2>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">{user?.email}</p>
                
                <div className="mt-8 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/5 text-white text-xs font-bold uppercase rounded-2xl border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-guinee-green" />
                    Rôle : {user?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aide / Support */}
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <ShieldAlert className="w-20 h-20" />
             </div>
             <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-tight">Assistance</h3>
             <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Pour toute modification de vos droits d'accès ou changement d'institution, veuillez contacter le support technique national.</p>
             <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border border-white/10">
               Contacter le Support
             </button>
          </div>
        </div>

        {/* Détails et Stats */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="dark-glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                <div className={clsx("w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10 transition-all shadow-xl", stat.glow)}>
                  <stat.icon className={clsx("w-5 h-5", stat.color)} />
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Informations détaillées */}
          <div className="dark-glass rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="font-bold text-white text-lg flex items-center gap-3 uppercase tracking-tight">
                 <ShieldCheck className="w-6 h-6 text-guinee-green" />
                 Accréditations Officielles
              </h3>
              <Zap className="w-5 h-5 text-guinee-yellow animate-float" />
            </div>
            
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
              {infoFields.map((field) => (
                <div key={field.label} className="space-y-3 group">
                  <div className="flex items-center gap-3 text-slate-500 group-hover:text-white transition-colors">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                       <field.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase ">{field.label}</span>
                  </div>
                  {field.isBadge ? (
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-guinee-green/10 text-guinee-green border border-guinee-green/20 uppercase tracking-wider">
                      {field.value}
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-white tracking-tight ml-1">{field.value}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-white/[0.01] border-t border-white/5 text-center">
                <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase flex items-center gap-2 mx-auto group">
                   Modifier les préférences <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile
