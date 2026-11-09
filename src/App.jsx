import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/common/AuthModal';
import { MatrixRain } from './components/common/MatrixRain';
import { WeatherNewsSection } from './components/weather-news/WeatherNewsSection';
import { BlogSection } from './components/blog/BlogSection';
import { PortfolioSection } from './components/portfolio/PortfolioSection';
import { AboutSection } from './components/about/AboutSection';

function AppContent() {
  const [activeTab, setActiveTab] = useState('weather-news');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-matrix-bg scanline flex flex-col justify-between relative overflow-x-hidden">

      {/* Animation de pluie de code Matrix en arrière-plan */}
      <MatrixRain />

      {/* Barre de Navigation Principale */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Contenu Dynamique (placé au-dessus du canvas grâce à z-10) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative z-10">
        {activeTab === 'weather-news' && <WeatherNewsSection />}
        {activeTab === 'blog' && <BlogSection />}
        {activeTab === 'portfolio' && <PortfolioSection />}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Footer Système */}
      <footer className="border-t border-matrix-border bg-matrix-card/90 py-4 px-4 text-center text-xs font-mono text-matrix-muted relative z-10">
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