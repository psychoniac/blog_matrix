import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/common/AuthModal';
import { WeatherNewsSection } from './components/weather-news/WeatherNewsSection';
import { BlogSection } from './components/blog/BlogSection';
import { AboutSection } from './components/about/AboutSection';
import { PortfolioSection } from './components/portfolio/PortfolioSection';

// Note : Le module Portfolio pourra être branché ici dès que tu le souhaiteras
import { Briefcase } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('weather-news');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-matrix-bg scanline flex flex-col justify-between">

      {/* Barre de Navigation Principale */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Contenu Dynamique selon l'onglet actif */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {activeTab === 'weather-news' && <WeatherNewsSection />}
        {activeTab === 'blog' && <BlogSection />}
        {activeTab === 'portfolio' && (
          <div className="max-w-4xl mx-auto text-center py-20 bg-matrix-card border border-matrix-border shadow-neon space-y-4">
            <Briefcase className="w-12 h-12 text-matrix-neon mx-auto animate-pulse" />
            <PortfolioSection />
          </div>
        )}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer Système */}
      <footer className="border-t border-matrix-border bg-matrix-card/80 py-4 px-4 text-center text-xs font-mono text-matrix-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span>SYSTEM STATUS : <strong className="text-matrix-neon">ONLINE [SECURE]</strong></span>
          <span>MATRIX HUB v1.0 // VITE + REACT + SUPABASE</span>
          <span>LA ROCHELLE, FRANCE</span>
        </div>
      </footer>

      {/* Modal d'Authentification */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}