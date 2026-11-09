import { Terminal, Code2, Mail, ExternalLink, MapPin } from 'lucide-react';

export const AboutSection = () => {
    const skills = [
        "JavaScript (ES6+)", "React", "Next.js", "Astro", "Vite",
        "Tailwind CSS", "Node.js", "Express", "Python", "FastAPI",
        "Supabase", "SQLite", "Git / GitHub", "Docker & IoT"
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-mono pb-12">

            {/* En-tête de section */}
            <div className="flex items-center space-x-3 border-b border-matrix-border pb-4">
                <Terminal className="w-6 h-6 text-matrix-neon" />
                <h2 className="text-xl font-bold text-matrix-neon tracking-wider uppercase">
                    SYS_PROFILE // À PROPOS DU DÉVELOPPEUR
                </h2>
            </div>

            {/* Carte d'identité Hacker */}
            <div className="bg-matrix-card border border-matrix-border p-6 shadow-neon space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-matrix-muted/40 pb-4 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-matrix-text">DÉVELOPPEUR FULL-STACK & SYSTÈMES</h3>
                        <p className="text-xs text-matrix-neon mt-1">Basé à La Rochelle, France</p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs bg-matrix-bg px-3 py-1.5 border border-matrix-muted">
                        <MapPin className="w-4 h-4 text-matrix-neon" />
                        <span className="text-matrix-text">STATUT : RECHERCHE OPPORTUNITÉ / PROJETS</span>
                    </div>
                </div>

                <div className="space-y-4 text-xs text-matrix-text/90 leading-relaxed">
                    <p>
                        {">"} Bienvenue dans mon espace numérique. En reconversion professionnelle vers le développement web, je conçois et déploie des applications full-stack robustes, modulaires et orientées utilisateur.
                    </p>
                    <p>
                        {">"} Mon parcours allie une appétence marquée pour le code propre (React, Node.js, Python) et une curiosité pour l'ingénierie système, l'automatisation IoT et la création d'interfaces au design immersif.
                    </p>
                </div>

                {/* Compétences techniques */}
                <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-matrix-neon uppercase flex items-center space-x-2">
                        <Code2 className="w-4 h-4" />
                        <span>STACK TECHNOLOGIQUE PRINCIPALE</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <span key={index} className="bg-matrix-bg border border-matrix-muted px-3 py-1 text-xs text-matrix-text hover:border-matrix-neon transition-colors">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Liens de contact / Réseaux */}
                <div className="pt-4 border-t border-matrix-muted/30 flex flex-wrap gap-4 text-xs">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-matrix-neon hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>GitHub Portfolio</span>
                    </a>
                    <a
                        href="mailto:contact@matrix-hub.local"
                        className="flex items-center space-x-2 text-matrix-neon hover:underline"
                    >
                        <Mail className="w-4 h-4" />
                        <span>Me Contacter</span>
                    </a>
                </div>

            </div>

        </div>
    );
};