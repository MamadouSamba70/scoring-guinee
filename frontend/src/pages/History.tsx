import React from 'react'
import { useAuthStore } from '../store/authStore'
import { 
  History as HistoryIcon, 
  User, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronRight,
  Trash2,
  FileText,
  ShieldCheck
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { clsx } from 'clsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/scoring/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring-history'] })
      toast.success('Entrée supprimée de l\'historique')
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const handleDownload = (item: any) => {
    const doc = new jsPDF()
    
    // --- En-tête (Style Lettre/Document officiel) ---
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Scoring-Guinee', 14, 20)
    doc.text("Service d'Analyse des Risques", 14, 25)
    
    // Date à droite
    const dateStr = new Date(item.created_at).toLocaleDateString('fr-FR')
    doc.text(`Conakry, le ${dateStr}`, 150, 20)
    
    // Ligne de séparation
    doc.setDrawColor(200)
    doc.line(14, 30, 196, 30)

    // --- Titre du Document ---
    doc.setFontSize(16)
    doc.setTextColor(0, 148, 96) // Vert institutionnel
    doc.setFont('helvetica', 'bold')
    doc.text("FICHE D'EVALUATION DE CREDIT", 105, 45, { align: 'center' })
    doc.setFont('helvetica', 'normal')

    // --- Section 1 : Informations du Client ---
    doc.setFontSize(12)
    doc.setTextColor(40)
    doc.setFont('helvetica', 'bold')
    doc.text('1. Identification du demandeur', 14, 60)
    doc.setFont('helvetica', 'normal')
    
    doc.setFontSize(11)
    doc.setTextColor(60)
    doc.text(`Nom complet : ${item.client_name}`, 14, 70)
    doc.text(`Reference du dossier : N° ${item.id}`, 14, 77)
    doc.text(`Conseiller en charge : ${item.agent_name || 'Non assigne'}`, 14, 84)

    // --- Section 2 : Avis de Solvabilité ---
    doc.setFontSize(12)
    doc.setTextColor(40)
    doc.setFont('helvetica', 'bold')
    doc.text("2. Synthese de la capacite d'emprunt", 14, 100)
    doc.setFont('helvetica', 'normal')
    
    doc.setFontSize(11)
    doc.setTextColor(60)
    doc.text(`Indice de confiance (Score) : ${item.score.toFixed(1)} / 100`, 14, 110)
    
    if (item.probabilite_defaut) {
      doc.text(`Risque estime d'impaye : ${(item.probabilite_defaut * 100).toFixed(1)}%`, 14, 117)
    }

    if (item.montant_recommande_gnf) {
      doc.text(`Capacite de financement suggeree : ${item.montant_recommande_gnf.toLocaleString('fr-FR')} GNF`, 14, 124)
    }

    // --- Recommandation finale (Cadre léger) ---
    doc.setDrawColor(220)
    doc.rect(14, 135, 182, 25)
    
    const decisionText = item.decision === 'approuve' ? 'AVIS FAVORABLE' : 'AVIS DEFAVORABLE'
    const decisionColor = item.decision === 'approuve' ? [0, 148, 96] : [206, 17, 38]
    
    doc.setFont('helvetica', 'bold')
    doc.text(`Avis du systeme :`, 20, 145)
    doc.setTextColor(decisionColor[0], decisionColor[1], decisionColor[2])
    doc.text(decisionText, 20, 153)

    // --- Pied de page ---
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text("Document genere pour usage interne. Les recommandations doivent etre validees par le comite de credit.", 14, 280)

    // Sauvegarde
    doc.save(`Fiche_Evaluation_${item.client_name.replace(/\s+/g, '_')}.pdf`)
    toast.success("Fiche d'evaluation telechargee", { icon: '📄' })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-white/5 border-t-guinee-green rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extraction des archives...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-reveal pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-guinee-yellow rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase ">Archives Système Certifiées</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Historique des <span className="text-guinee-yellow">Scorings</span></h1>
          <p className="text-slate-500 font-medium mt-1">Traçabilité complète des évaluations de solvabilité.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {history?.length || 0} ENTRÉES
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="dark-glass rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Bénéficiaire</th>
                <th>Horodatage</th>
                <th>Indice de Score</th>
                <th>Décision IA</th>
                <th>Opérateur Agent</th>
                <th className="text-right">Archives</th>
              </tr>
            </thead>
            <tbody>
              {history?.map((item: any) => (
                <tr key={item.id} className="group">
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:border-guinee-yellow/50 transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-tight">{item.client_name}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-guinee-yellow" />
                        {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                        <div 
                          className={clsx(
                            "h-full rounded-full transition-all duration-1000",
                            item.score >= 70 ? "bg-guinee-green shadow-[0_0_8px_rgba(0,148,96,0.4)]" : 
                            item.score >= 40 ? "bg-guinee-yellow shadow-[0_0_8px_rgba(252,209,22,0.4)]" : 
                            "bg-guinee-red shadow-[0_0_8px_rgba(206,17,38,0.4)]"
                          )} 
                          style={{ width: `${item.score}%` }} 
                        />
                      </div>
                      <span className="font-bold text-white text-xs tracking-tight">{item.score.toFixed(1)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={clsx(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase border",
                      item.decision === 'approuve' 
                        ? "bg-guinee-green/10 text-guinee-green border-guinee-green/20" 
                        : "bg-guinee-red/10 text-guinee-red border-guinee-red/20"
                    )}>
                      {item.decision === 'approuve' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.decision}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                       <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                       {item.agent_name}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          if (window.confirm('Supprimer cette entrée ?')) {
                            deleteMutation.mutate(item.id)
                          }
                        }}
                        className="w-9 h-9 bg-white/5 text-slate-600 hover:text-guinee-red hover:bg-guinee-red/10 rounded-lg border border-white/5 transition-all flex items-center justify-center"
                        title="Archiver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(item)}
                        className="w-9 h-9 bg-white/5 text-slate-600 hover:text-guinee-yellow hover:bg-white/10 rounded-lg border border-white/5 transition-all flex items-center justify-center"
                        title="Télécharger le rapport"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!history || history.length === 0) && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-800">
                  <HistoryIcon className="w-10 h-10" />
               </div>
               <p className="text-xs font-bold text-slate-600 uppercase ">Aucun enregistrement dans les archives nationales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History
