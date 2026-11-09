import { Terminal, CloudSun, BookOpen, Briefcase, User as UserIcon, LogOut, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MatrixButton } from '../common/MatrixButton';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuthModal }) => {
    const { user, signOut } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'SYS_INFO', icon: Terminal },
        { id: 'weather-news', label: 'METEO_ACTUS', icon: CloudSun },
        { id: 'blog', label: 'DATABASE_BLOG', icon: BookOpen },
        { id: 'portfolio', label: 'PROJECTS', icon: Briefcase },
    ];

    return (
        <header className="border-b border-matrix-border bg-matrix-card/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo / System Status */}
                <div className="flex items-center space-x-3">
                    <Cpu className="w-6 h-6 text-matrix-neon animate-pulse" />
                    <span className="font-mono text-matrix-neon font-bold tracking-widest text-lg">
                        MATRIX_HUB<span className="text-matrix-border">.v1.0</span>
                    </span>
                </div>

                {/* Navigation Tabs */}
                <nav className="hidden md:flex space-x-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center space-x-2 px-3 py-2 text-xs uppercase tracking-wider font-mono transition-all border ${isActive
                                    ? 'bg-matrix-border/30 border-matrix-neon text-matrix-neon shadow-neon'
                                    : 'border-transparent text-matrix-text/70 hover:text-matrix-neon hover:border-matrix-muted'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Auth Section */}
                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center space-x-3 bg-matrix-bg px-3 py-1.5 border border-matrix-muted">
                            <UserIcon className="w-4 h-4 text-matrix-neon" />
                            <span className="text-xs text-matrix-text truncate max-w-[120px]">
                                {user.email}
                            </span>
                            <button
                                onClick={signOut}
                                title="Déconnexion"
                                className="text-red-400 hover:text-red-300 transition-colors ml-2"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <MatrixButton onClick={onOpenAuthModal} variant="primary">
                            Connexion
                        </MatrixButton>
                    )}
                </div>

            </div>

            {/* Mobile Sub-nav bar */}
            <div className="flex md:hidden overflow-x-auto border-t border-matrix-muted px-2 py-2 space-x-2 bg-matrix-bg">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center space-x-1 px-3 py-1.5 text-xs uppercase font-mono whitespace-nowrap border ${isActive
                                ? 'bg-matrix-border/30 border-matrix-neon text-matrix-neon'
                                : 'border-transparent text-matrix-text/60'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </header>
    );
};