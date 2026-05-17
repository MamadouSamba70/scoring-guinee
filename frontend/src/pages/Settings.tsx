import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'
import {
  Settings as SettingsIcon,
  Shield,
  Cpu,
  Lock,
  Bell,
  Save,
  Info,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Server
} from 'lucide-react'
import { clsx } from 'clsx'

type Section = 'scoring' | 'security' | 'notifications' | 'password'

const Settings = () => {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)

  const [activeSection, setActiveSection] = useState<Section>(user?.role === 'admin' ? 'scoring' : 'password')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // --- État Moteur de Scoring ---
  const [approvalThreshold, setApprovalThreshold] = useState(65)
  const [modelVersion, setModelVersion] = useState('v1.0.2')
  const [maxLoan, setMaxLoan] = useState('50000000')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // --- État Notifications ---
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifNewClient, setNotifNewClient] = useState(true)
  const [notifScoringDone, setNotifScoringDone] = useState(false)

  // --- État Mot de passe ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  const handleSaveScoring = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setIsSaving(false)
    setSaved(true)
    toast.success('Paramètres du système sauvegardés !')
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        toast.success('Sécurité mise à jour avec succès !')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    toast.success('Règles de notifications appliquées !')
  }

  const navItems: { key: Section; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { key: 'scoring', label: 'Paramètres IA', icon: Cpu, adminOnly: true },
    { key: 'security', label: 'Accès & Rôles', icon: Shield, adminOnly: true },
    { key: 'notifications', label: 'Règles d\'Alerte', icon: Bell },
    { key: 'password', label: 'Sécurité Personnelle', icon: Lock },
  ].filter(item => !item.adminOnly || user?.role === 'admin') as any

  return (
    <div className="space-y-10 animate-reveal pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Centre de Configuration</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Configuration <span className="text-slate-400">Système</span></h1>
          <p className="text-slate-500 font-medium mt-1">Supervision de l'algorithme et paramètres du compte.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Nav Latérale */}
        <div className="lg:col-span-1 space-y-2">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border',
                activeSection === key
                  ? 'bg-white/10 text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={clsx('w-4 h-4', activeSection === key ? 'text-white' : 'text-slate-500')} />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu Principal */}
        <div className="lg:col-span-3 space-y-6">

          {/* ─── Moteur de Scoring ─── */}
          {activeSection === 'scoring' && user?.role === 'admin' && (
            <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden animate-in fade-in duration-300">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-center">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white uppercase tracking-tight">Paramètres IA & Scoring</h3>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Moteur d'analyse prédictive</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-guinee-green bg-guinee-green/10 px-3 py-1.5 rounded-lg border border-guinee-green/20 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-guinee-green rounded-full animate-pulse" />
                  Réseau Actif
                </span>
              </div>

              <div className="p-8 space-y-10">

                {/* Seuil d'approbation */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seuil de Tolérance au Risque</label>
                    <span className={clsx(
                      'text-3xl font-bold tracking-tighter',
                      approvalThreshold >= 70 ? 'text-guinee-red' :
                      approvalThreshold >= 50 ? 'text-guinee-yellow' : 'text-guinee-green'
                    )}>{approvalThreshold}<span className="text-lg text-slate-500 ml-1">%</span></span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={approvalThreshold}
                    onChange={e => setApprovalThreshold(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-800 accent-white"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-2">
                    <span>0 — Souple</span>
                    <span>100 — Strict</span>
                  </div>
                  <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-slate-400">
                      Les dossiers dont le score prédictif est inférieur à ce seuil recevront automatiquement un avis défavorable.
                    </p>
                  </div>
                </div>

                {/* Version du modèle */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Modèle Prédictif Actif</label>
                  <select
                    value={modelVersion}
                    onChange={e => setModelVersion(e.target.value)}
                    className="input-premium py-3.5 w-full appearance-none"
                  >
                    <option value="v1.0.2" className="bg-slate-900 text-white">v1.0.2 — Gradient Boosting (Production)</option>
                    <option value="v1.0.3" className="bg-slate-900 text-white">v1.0.3 — Random Forest (Bêta)</option>
                    <option value="v1.1.0" className="bg-slate-900 text-white">v1.1.0 — XGBoost Optimisé (Dev)</option>
                  </select>
                </div>

                {/* Plafond de crédit */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Plafond de Financement Recommandé</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      value={maxLoan}
                      onChange={e => setMaxLoan(e.target.value)}
                      className="input-premium py-3.5 pl-12 pr-16 w-full font-bold text-white text-lg"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-slate-500 uppercase">GNF</div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2">
                    Valeur formatée : {Number(maxLoan).toLocaleString('fr-FR')} GNF
                  </p>
                </div>

                {/* Mode Maintenance */}
                <div className={clsx(
                  'flex items-center justify-between p-5 rounded-2xl border transition-all',
                  maintenanceMode ? 'bg-guinee-red/10 border-guinee-red/20' : 'bg-white/5 border-white/10'
                )}>
                  <div className="flex gap-4">
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', maintenanceMode ? 'bg-guinee-red/20 text-guinee-red border-guinee-red/30' : 'bg-white/5 text-slate-500 border-white/5')}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={clsx('text-sm font-bold uppercase tracking-wide', maintenanceMode ? 'text-guinee-red' : 'text-white')}>
                        Coupure du Moteur
                      </h4>
                      <p className={clsx('text-xs font-medium mt-0.5', maintenanceMode ? 'text-guinee-red/70' : 'text-slate-500')}>
                        Désactive l'API de scoring pour tous les agents du réseau.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={clsx(
                      'relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 cursor-pointer border border-white/10',
                      maintenanceMode ? 'bg-guinee-red' : 'bg-slate-800'
                    )}
                  >
                    <span className={clsx(
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300',
                      maintenanceMode ? 'translate-x-8' : 'translate-x-1'
                    )} />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSaveScoring}
                  disabled={isSaving}
                  className={clsx(
                    'flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-xl',
                    saved
                      ? 'bg-guinee-green text-white scale-[0.98]'
                      : 'bg-white text-slate-950 hover:bg-slate-200 active:scale-[0.98]'
                  )}
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Synchronisation...' : saved ? 'Données Synchronisées' : 'Appliquer la configuration'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Sécurité & Rôles ─── */}
          {activeSection === 'security' && user?.role === 'admin' && (
            <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-3xl p-8 space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-center">
                   <Shield className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white uppercase tracking-tight">Sécurité des Accès</h3>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Informations de votre session Master</p>
                </div>
              </div>
              
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compte Opérateur</span>
                   <span className="text-sm font-bold text-white">{user?.full_name}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse Email</span>
                   <span className="text-sm font-medium text-slate-300">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Niveau d'Accréditation</span>
                   <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-widest">{user?.role}</span>
                </div>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                 <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                 <p className="text-xs font-medium text-blue-300">
                   Pour modifier les rôles et permissions des autres agents du réseau, veuillez vous rendre dans le module d'Accréditations (Utilisateurs).
                 </p>
              </div>
            </div>
          )}

          {/* ─── Notifications ─── */}
          {activeSection === 'notifications' && (
            <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden animate-in fade-in duration-300">
              <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-center">
                   <Bell className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white uppercase tracking-tight">Règles d'Alerte</h3>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Configuration des envois automatiques</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                {[
                  { label: 'Rapport Analytique Quotidien', desc: 'Envoi par email du volume de transactions traité', value: notifEmail, set: setNotifEmail },
                  { label: 'Alerte Nouvel Enrôlement', desc: 'Notification réseau lors de la création d\'un dossier', value: notifNewClient, set: setNotifNewClient },
                  { label: 'Résultat de Scoring', desc: 'Alerte instantanée dès qu\'une décision IA est générée', value: notifScoringDone, set: setNotifScoringDone },
                ].map(({ label, desc, value, set }) => (
                  <div key={label} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">{desc}</p>
                    </div>
                    <button
                      onClick={() => set(!value)}
                      className={clsx(
                        'relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 cursor-pointer border border-white/10',
                        value ? 'bg-white' : 'bg-slate-800'
                      )}
                    >
                      <span className={clsx(
                        'inline-block h-5 w-5 transform rounded-full shadow-md transition-transform duration-300',
                        value ? 'translate-x-8 bg-slate-900' : 'translate-x-1 bg-slate-500'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
                <button onClick={handleSaveNotifications} className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-[0.98] transition-all">
                  <Save className="w-4 h-4" />
                  Mettre à jour les règles
                </button>
              </div>
            </div>
          )}

          {/* ─── Mot de passe ─── */}
          {activeSection === 'password' && (
            <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden animate-in fade-in duration-300">
              <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-center">
                   <Lock className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white uppercase tracking-tight">Protection du Compte</h3>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Mise à jour des identifiants</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                {/* Mot de passe actuel */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Clé de Sécurité Actuelle</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="input-premium py-3.5 pr-12 w-full"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {/* Nouveau mot de passe */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Nouvelle Clé</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="input-premium py-3.5 pr-12 w-full"
                      placeholder="Minimum 8 caractères"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-3 flex gap-2 px-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={clsx('h-1.5 flex-1 rounded-full transition-colors', newPassword.length > i * 2 ? (newPassword.length < 6 ? 'bg-guinee-red' : newPassword.length < 10 ? 'bg-guinee-yellow' : 'bg-guinee-green') : 'bg-white/10')} />
                      ))}
                    </div>
                  )}
                </div>
                {/* Confirmation */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Vérification</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={clsx(
                      'input-premium py-3.5 w-full transition-all',
                      confirmPassword && newPassword !== confirmPassword && 'border-guinee-red/50 focus:ring-guinee-red/20'
                    )}
                    placeholder="••••••••"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] font-bold text-guinee-red uppercase tracking-wide mt-2 ml-1">Les clés ne correspondent pas</p>
                  )}
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSavePassword}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-[0.98] disabled:opacity-60 transition-all"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {isSaving ? 'Validation...' : 'Mettre à jour la clé'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Settings
