import { Link } from 'react-router-dom'
import { 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Smartphone,
  Globe
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Landing = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-slate-900">Scoring GN</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Solutions</a>
            <a href="#impact" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Impact Social</a>
            <a href="#security" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Sécurité</a>
          </div>

          <Link 
            to={isAuthenticated ? "/" : "/login"} 
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            {isAuthenticated ? "Accéder au Dashboard" : "Connexion Portail"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-guinee-green/5 rounded-full blur-3xl opacity-30" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Globe className="w-3.5 h-3.5" />
            L'inclusion financière au service de la Guinée
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
            Scoring Intelligent pour <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-guinee-green">les Micro-Entrepreneurs</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed">
            Propulsez la croissance économique en Guinée. Notre algorithme IA transforme les données Mobile Money 
            en opportunités de crédit pour les commerçants, agriculteurs et artisans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2">
              Découvrir la Plateforme
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              Voir la démo vidéo
            </button>
          </div>

          <div className="mt-20 pt-20 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-1">94%</p>
              <p className="text-sm text-slate-500">Précision IA</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-1">2min</p>
              <p className="text-sm text-slate-500">Temps de Scoring</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-1">0G</p>
              <p className="text-sm text-slate-500">Inclusion Totale</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-1">100%</p>
              <p className="text-sm text-slate-500">Données Sécurisées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="features" className="py-32 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6">Une plateforme pour chaque acteur</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Un écosystème complet pour fluidifier le parcours de crédit, du terrain à la direction.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
              <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Entrepreneurs</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Accédez à votre score de crédit en temps réel. Suivez votre éligibilité et bénéficiez de conseils personnalisés pour améliorer votre santé financière.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-guinee-green" /> Consultation via Mobile
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-guinee-green" /> Certificat de scoring PDF
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
              <div className="w-16 h-16 bg-guinee-green/10 rounded-3xl flex items-center justify-center text-guinee-green mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Agents de Terrain</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Digitalisez la collecte d'informations. Saisissez les données mobile money et obtenez une recommandation instantanée pour vos clients.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-guinee-green" /> Saisie simplifiée
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-guinee-green" /> Gestion de portefeuille
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
              <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center text-primary-600 mb-8 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Administrateurs</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Contrôlez et validez les dossiers. Supervisez les performances des agents et analysez les tendances économiques par région.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-guinee-green" /> Workflow de validation
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-guinee-green" /> Statistiques avancées
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="security" className="py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
          <div>
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-8 leading-tight">
              Une technologie de pointe, <br />
              conçue pour la Guinée.
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Omnicanal</h4>
                  <p className="text-slate-500 text-sm">Fonctionne avec les données Orange Money et MTN MoMo pour une couverture maximale du pays.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">IA Expliquable</h4>
                  <p className="text-slate-500 text-sm">Chaque score est justifié par des facteurs concrets (Ancienneté, Flux, Solde) pour une transparence totale.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-tr from-primary-600 to-guinee-green rounded-[3rem] rotate-3 relative overflow-hidden shadow-2xl shadow-primary-600/20">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-60" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-bounce-slow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Dossier Validé</p>
                  <p className="font-bold text-slate-900">Score de 78.4 / 100</p>
                </div>
              </div>
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-guinee-green" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-display font-bold">Scoring GN</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 République de Guinée - Plateforme d'Inclusion Financière</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Mentions Légales</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
