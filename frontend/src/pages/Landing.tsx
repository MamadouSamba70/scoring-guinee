import { Link } from 'react-router-dom'
import { 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Smartphone,
  Globe,
  Database,
  Lock,
  TrendingUp,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Landing = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-guinee-green/30 font-sans overflow-x-hidden">
      
      {/* Background Cinématique Global */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('/premium-bg.png')] bg-cover bg-fixed mix-blend-overlay" />
        {/* Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-guinee-green/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-guinee-red/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shadow-lg bg-white shrink-0 flex items-center justify-center hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Sceau Académique" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight uppercase">
              Scoring-<span className="text-guinee-green">Guinée</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {['Contexte', 'Méthodologie', 'Impact'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} 
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase "
              >
                {item}
              </a>
            ))}
          </div>

          <Link 
            to={isAuthenticated ? "/app" : "/login"} 
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 uppercase tracking-wider shadow-lg"
          >
            <span className="relative z-10">{isAuthenticated ? "Accéder au Moteur" : "Portail IMF"}</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-reveal">
            <div className="flex items-end gap-6 mb-8">
              <img src="/logo.png" alt="Sceau du Projet" className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 animate-float" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-guinee-green rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                Mini-Projet III — Académique
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.05] tracking-tight">
              Scoring de Crédit <span className="text-gradient-premium bg-gradient-to-r from-guinee-green to-emerald-400 bg-clip-text text-transparent">Alternatif</span>.
            </h1>
            <p className="text-lg text-slate-400 mb-12 leading-relaxed max-w-xl font-medium">
              Une solution de Machine Learning utilisant les données Mobile Money pour évaluer la solvabilité des micro-entrepreneurs du secteur informel guinéen.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-bold shadow-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 group uppercase tracking-wider text-xs">
                Déployer l'algorithme
                <Zap className="w-4 h-4 text-guinee-green group-hover:scale-125 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute inset-0 bg-guinee-green/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative dark-glass rounded-[3rem] p-4 border border-white/10 shadow-2xl overflow-hidden group">
              <img 
                src="/landing-hero.png" 
                alt="Architecture du Moteur ML" 
                className="w-full h-auto rounded-[2rem] transition-transform duration-700 group-hover:scale-105 opacity-90"
              />
              <div className="absolute bottom-10 left-10 right-10 p-6 glass rounded-2xl border border-white/20 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Hypothèse H2 Testée</span>
                  <span className="text-xs font-bold text-guinee-green">ML &gt; Manuel</span>
                </div>
                <p className="text-[10px] text-slate-300 uppercase tracking-wide">
                  Le score ML prédit mieux le défaut qu'une évaluation classique IMF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contexte & Problématique */}
      <section id="contexte" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Bancarisation Formelle (BCRG 2023)", val: "23%", col: "text-guinee-red" },
                  { label: "Pénétration Mobile Money (ARPT 2023)", val: "62%", col: "text-guinee-green" },
                  { label: "Guinéens Adultes Exclus", val: "9M", col: "text-guinee-yellow" },
                  { label: "Taux de Défaut IMF (APIMG 2022)", val: "12-18%", col: "text-slate-300" },
                ].map((stat, i) => (
                  <div key={i} className="p-8 dark-glass rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                    <p className={`text-4xl font-bold ${stat.col} mb-3 tracking-tighter`}>{stat.val}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-guinee-yellow/10 border border-guinee-yellow/20 text-guinee-yellow rounded-full text-[10px] font-bold uppercase mb-6 tracking-widest">
                Contexte Économique
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                Pallier l'absence de <span className="text-guinee-yellow">Bureau de Crédit</span> centralisé.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-10">
                En Guinée, le commerce et l'artisanat font vivre des millions de familles, mais avec des revenus souvent irréguliers. Sans historique bancaire classique, les micro-entrepreneurs ont du mal à obtenir des financements. Les institutions (CRG, FINADEV, Yété Mali) font un travail formidable, mais l'évaluation manuelle reste longue et parfois subjective, ce qui freine l'inclusion (taux de défaut à 12-18% contre 5% dans l'espace WAEMU).
              </p>
              <div className="space-y-4">
                {[
                  "77% de la population exclue des crédits formels",
                  "Méthodes d'évaluation manuelles et subjectives des IMF",
                  "Dépendance aux cycles commerciaux (marchés, fêtes)"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-guinee-red/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-guinee-red" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology - 12 Variables */}
      <section id="methodologie" className="py-32 px-6 bg-white/[0.02] relative z-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-xs font-bold text-guinee-green uppercase tracking-widest">Dataset Synthétique Guinéen</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 tracking-tight">Encodage sur 12 Variables Prédictives.</h2>
            <p className="text-slate-400 text-sm mt-6 max-w-2xl mx-auto">Modèle inspiré des FinTechs Tala et Branch, exploitant l'empreinte transactionnelle des portefeuilles électroniques.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Stabilité & Récurrence", 
                desc: "Analyse de l'ancienneté du compte mobile et du nombre de crédits reçus sur 30 jours (proxy des revenus informels).", 
                icon: Database,
                step: "01"
              },
              { 
                title: "Ratios & Comportements", 
                desc: "Calcul du solde moyen sur 6 mois (épargne) et du ratio d'endettement comportemental (Dépenses/Revenus).", 
                icon: BarChart3,
                step: "02"
              },
              { 
                title: "Filets de Sécurité", 
                desc: "Prise en compte des virements de la diaspora comme filet de sécurité et de l'historique de paiement.", 
                icon: Shield,
                step: "03"
              },
            ].map((item, i) => (
              <div key={i} className="group p-10 dark-glass rounded-[2.5rem] border border-white/5 hover:border-guinee-green/30 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-8 text-8xl font-bold text-white/[0.03] group-hover:text-guinee-green/5 transition-colors">{item.step}</div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform border border-white/10 shadow-lg">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="dark-glass rounded-[4rem] p-12 md:p-20 border border-white/10 shadow-4xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-guinee-green/10 via-transparent to-blue-500/10 pointer-events-none" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight">Comprendre et valoriser chaque parcours financier.</h2>
                <div className="space-y-8">
                  {[
                    { t: "Ciblage Optimal", d: "Adaptation aux profils 25-45 ans, en valorisant les femmes commerçantes (meilleures performeuses CRG).", i: Users },
                    { t: "Modèle Contextuel", d: "Prise en compte des risques différenciés par secteur (Commerce > Transport > Artisanat).", i: TrendingUp },
                    { t: "Géographie", d: "Distinction de l'accès aux services entre Conakry et les préfectures de l'intérieur.", i: Globe },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-slate-900 transition-all">
                        <item.i className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-2">{item.t}</h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950/80 rounded-[3rem] p-10 border border-white/10 shadow-inner backdrop-blur-md">
                <h3 className="text-lg font-bold mb-8 flex items-center gap-3 text-white uppercase tracking-wider">
                  <Award className="w-5 h-5 text-guinee-yellow" />
                  Institutions Ciblées
                </h3>
                <div className="space-y-6">
                  {[
                    { l: "Crédit Rural de Guinée (CRG)", v: "94 Caisses", p: "100%", c: "bg-guinee-green" },
                    { l: "FINADEV", v: "40 Agences", p: "60%", c: "bg-blue-500" },
                    { l: "Yété Mali & PRIDE", v: "Réseau National", p: "45%", c: "bg-guinee-yellow" },
                  ].map((goal, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        <span>{goal.l}</span>
                        <span className="text-white">{goal.v}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${goal.c} shadow-[0_0_10px_currentColor]`} style={{ width: goal.p }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40 px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-12 tracking-tight leading-tight">
            Accompagner la croissance <span className="text-guinee-green">des entrepreneurs guinéens</span>.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/login" className="w-full sm:w-auto px-16 py-6 bg-white text-slate-950 rounded-2xl font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 justify-center">
              Accéder à la plateforme <Zap className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Application développée dans le cadre du Mini-Projet III
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Projet" className="w-10 h-10 object-contain drop-shadow-lg opacity-80" />
              <span className="text-lg font-bold text-slate-400 tracking-tight uppercase">Scoring-Guinée</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center md:text-left">
              Mini-Projet III — Moteur de Scoring Alternatif
            </p>
          </div>
          
          <div className="flex items-center gap-8">
             <Link to="/login" className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
               Accès Interface IMF <ChevronRight className="w-3 h-3" />
             </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
