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
} from 'lucide-react'
import { clsx } from 'clsx'

type Section = 'scoring' | 'security' | 'notifications' | 'password'

const Settings = () => {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)

  const [activeSection, setActiveSection] = useState<Section>('scoring')
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
    toast.success('Paramètres de scoring sauvegardés !')
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
        toast.success('Mot de passe mis à jour avec succès !')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      toast.error('Erreur lors du changement de mot de passe.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    toast.success('Préférences de notifications enregistrées !')
  }

  const navItems: { key: Section; label: string; icon: React.ElementType }[] = [
    { key: 'scoring', label: 'Moteur de Scoring', icon: Cpu },
    { key: 'security', label: 'Sécurité & Rôles', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'password', label: 'Mon Mot de passe', icon: Lock },
  ]

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Paramètres du Système</h1>
        <p className="text-slate-500">Configurez le moteur de scoring et gérez votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Nav Latérale */}
        <div className="lg:col-span-1 space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                activeSection === key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className={clsx('w-5 h-5', activeSection === key ? 'text-white' : 'text-slate-400')} />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu Principal */}
        <div className="lg:col-span-3 space-y-6">

          {/* ─── Moteur de Scoring ─── */}
          {activeSection === 'scoring' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Configuration de l'IA</h3>
                </div>
                <span className="text-xs font-bold text-guinee-green bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  Modèle Actif
                </span>
              </div>

              <div className="p-6 space-y-6">

                {/* Seuil d'approbation */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-700">Seuil d'Approbation (Score)</label>
                    <span className={clsx(
                      'text-2xl font-bold tabular-nums',
                      approvalThreshold >= 70 ? 'text-red-600' :
                      approvalThreshold >= 50 ? 'text-primary-600' : 'text-guinee-green'
                    )}>{approvalThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={approvalThreshold}
                    onChange={e => setApprovalThreshold(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 — Très souple</span>
                    <span>100 — Très strict</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Les dossiers en dessous de ce seuil seront automatiquement rejetés.
                  </p>
                </div>

                {/* Version du modèle */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Version du Modèle</label>
                  <select
                    value={modelVersion}
                    onChange={e => setModelVersion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                  >
                    <option value="v1.0.2">v1.0.2 — Gradient Boosting (Production)</option>
                    <option value="v1.0.3">v1.0.3 — Random Forest (Bêta)</option>
                    <option value="v1.1.0">v1.1.0 — XGBoost Optimisé (Dev)</option>
                  </select>
                </div>

                {/* Plafond de crédit */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Plafond de Crédit Recommandé (GNF)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      value={maxLoan}
                      onChange={e => setMaxLoan(e.target.value)}
                      className="w-full pl-12 pr-16 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-slate-400">GNF</div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Valeur affichée : {Number(maxLoan).toLocaleString('fr-FR')} GNF
                  </p>
                </div>

                {/* Mode Maintenance */}
                <div className={clsx(
                  'flex items-center justify-between p-4 rounded-xl border transition-all',
                  maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                )}>
                  <div className="flex gap-3">
                    <div className={clsx('p-2 rounded-lg shadow-sm h-fit', maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-white text-slate-500')}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={clsx('text-sm font-bold', maintenanceMode ? 'text-red-900' : 'text-slate-900')}>
                        Mode Maintenance {maintenanceMode && '— ACTIF'}
                      </h4>
                      <p className={clsx('text-xs', maintenanceMode ? 'text-red-600' : 'text-slate-500')}>
                        Désactiver le moteur de scoring pour tous les agents temporairement.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer',
                      maintenanceMode ? 'bg-red-600' : 'bg-slate-200'
                    )}
                  >
                    <span className={clsx(
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300',
                      maintenanceMode ? 'translate-x-5' : 'translate-x-1'
                    )} />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveScoring}
                  disabled={isSaving}
                  className={clsx(
                    'flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all',
                    saved
                      ? 'bg-guinee-green text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  )}
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder les réglages'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Sécurité & Rôles ─── */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Shield className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900">Sécurité & Rôles</h3>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                <p className="font-semibold mb-1">Compte Administrateur</p>
                <p>Connecté en tant que : <span className="font-bold">{user?.full_name}</span></p>
                <p>Email : <span className="font-bold">{user?.email}</span></p>
                <p>Rôle : <span className="font-bold capitalize">{user?.role}</span></p>
              </div>
              <p className="text-sm text-slate-500">La gestion des rôles des agents se fait depuis la section <strong>Utilisateurs</strong>.</p>
            </div>
          )}

          {/* ─── Notifications ─── */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Bell className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900">Préférences de Notifications</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Notifications par email', desc: 'Recevoir un résumé quotidien par email', value: notifEmail, set: setNotifEmail },
                  { label: 'Nouveau client enregistré', desc: 'Alerte dès qu\'un agent ajoute un client', value: notifNewClient, set: setNotifNewClient },
                  { label: 'Score calculé', desc: 'Notification après chaque calcul de score', value: notifScoringDone, set: setNotifScoringDone },
                ].map(({ label, desc, value, set }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <button
                      onClick={() => set(!value)}
                      className={clsx(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer',
                        value ? 'bg-primary-600' : 'bg-slate-200'
                      )}
                    >
                      <span className={clsx(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300',
                        value ? 'translate-x-5' : 'translate-x-1'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={handleSaveNotifications} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* ─── Mot de passe ─── */}
          {activeSection === 'password' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Lock className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900">Changer mon Mot de passe</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full px-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      placeholder="Minimum 8 caractères"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={clsx('h-1 flex-1 rounded-full', newPassword.length > i * 2 ? (newPassword.length < 6 ? 'bg-red-400' : newPassword.length < 10 ? 'bg-yellow-400' : 'bg-guinee-green') : 'bg-slate-200')} />
                      ))}
                    </div>
                  )}
                </div>
                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={clsx(
                      'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 transition-all',
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-400 focus:ring-red-500/20'
                        : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-500'
                    )}
                    placeholder="••••••••"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSavePassword}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-60 transition-all"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Mettre à jour le mot de passe
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
