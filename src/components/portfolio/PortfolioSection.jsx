import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { MatrixButton } from '../common/MatrixButton';
import { Briefcase, Heart, MessageSquare, PlusCircle, ExternalLink, Send, User, Code } from 'lucide-react';

export const PortfolioSection = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showNewProjectForm, setShowNewProjectForm] = useState(false);

    // États du formulaire nouveau projet
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [techStack, setTechStack] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [liveUrl, setLiveUrl] = useState('');

    const [commentInputs, setCommentInputs] = useState({});
    const [loading, setLoading] = useState(false);

    // Vérifier si l'utilisateur est admin
    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                setIsAdmin(false);
                return;
            }
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            setIsAdmin(data?.role === 'admin');
        };
        checkAdmin();
    }, [user]);

    const fetchProjects = async () => {
        const { data: projectsData, error: projError } = await supabase
            .from('projects')
            .select(`
        *,
        profiles:author_id (username)
      `)
            .order('created_at', { ascending: false });

        if (projError) {
            console.error("Erreur projets:", projError.message);
            return;
        }

        const projectsWithDetails = await Promise.all(
            projectsData.map(async (project) => {
                const { data: likes } = await supabase
                    .from('project_likes')
                    .select('id, user_id')
                    .eq('project_id', project.id);

                const { data: comments } = await supabase
                    .from('project_comments')
                    .select(`
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (username)
          `)
                    .eq('project_id', project.id)
                    .order('created_at', { ascending: true });

                return {
                    ...project,
                    project_likes: likes || [],
                    project_comments: comments || []
                };
            })
        );

        setProjects(projectsWithDetails);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Création d'un projet (Admin)
    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setLoading(true);
        const techsArray = techStack ? techStack.split(',').map(t => t.trim()) : [];

        const { error } = await supabase.from('projects').insert([
            {
                title,
                description,
                tech_stack: techsArray,
                github_url: githubUrl || null,
                live_url: liveUrl || null,
                author_id: user.id
            }
        ]);

        if (!error) {
            setTitle('');
            setDescription('');
            setTechStack('');
            setGithubUrl('');
            setLiveUrl('');
            setShowNewProjectForm(false);
            fetchProjects();
        }
        setLoading(false);
    };

    // Like / Unlike d'un projet
    const handleToggleLike = async (project) => {
        if (!user) return alert('Connectez-vous pour liker ce projet.');

        const existingLike = project.project_likes.find(l => l.user_id === user.id);

        if (existingLike) {
            await supabase.from('project_likes').delete().eq('id', existingLike.id);
        } else {
            await supabase.from('project_likes').insert([{ project_id: project.id, user_id: user.id }]);
        }
        fetchProjects();
    };

    // Ajouter un commentaire sur un projet
    const handleAddComment = async (projectId) => {
        const commentText = commentInputs[projectId];
        if (!commentText?.trim() || !user) return;

        const { error } = await supabase.from('project_comments').insert([
            { project_id: projectId, user_id: user.id, content: commentText }
        ]);

        if (!error) {
            setCommentInputs({ ...commentInputs, [projectId]: '' });
            fetchProjects();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 font-mono pb-12">

            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-matrix-border pb-4">
                <div className="flex items-center space-x-3">
                    <Briefcase className="w-6 h-6 text-matrix-neon" />
                    <h2 className="text-xl font-bold text-matrix-neon tracking-wider uppercase">
                        SYS_PORTFOLIO // PROJETS & RÉALISATIONS
                    </h2>
                </div>
                {isAdmin && (
                    <MatrixButton onClick={() => setShowNewProjectForm(!showNewProjectForm)}>
                        <PlusCircle className="w-4 h-4 inline mr-2" />
                        {showNewProjectForm ? 'Fermer' : 'Nouveau Projet'}
                    </MatrixButton>
                )}
            </div>

            {/* Formulaire Admin */}
            {showNewProjectForm && isAdmin && (
                <form onSubmit={handleCreateProject} className="bg-matrix-card border border-matrix-border p-5 space-y-4 shadow-neon">
                    <h3 className="text-sm font-bold text-matrix-neon uppercase">[AJOUTER_UN_PROJET]</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-matrix-text mb-1">TITRE DU PROJET</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Application IoT GrowBox..."
                                className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text text-xs focus:border-matrix-neon outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-matrix-text mb-1">TECH STACK (séparées par des virgules)</label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                placeholder="React, Tailwind, Supabase, Python"
                                className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text text-xs focus:border-matrix-neon outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-matrix-text mb-1">DESCRIPTION</label>
                        <textarea
                            rows="4"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Détails techniques et objectifs du projet..."
                            className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text text-xs focus:border-matrix-neon outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-matrix-text mb-1">LIEN GITHUB (OPTIONNEL)</label>
                            <input
                                type="text"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text text-xs focus:border-matrix-neon outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-matrix-text mb-1">LIEN LIVE / DÉMO (OPTIONNEL)</label>
                            <input
                                type="text"
                                value={liveUrl}
                                onChange={(e) => setLiveUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text text-xs focus:border-matrix-neon outline-none"
                            />
                        </div>
                    </div>

                    <MatrixButton type="submit">
                        {loading ? 'DÉPLOIEMENT...' : 'ENREGISTRER LE PROJET'}
                    </MatrixButton>
                </form>
            )}

            {/* Liste des Projets */}
            <div className="space-y-6">
                {projects.length === 0 ? (
                    <p className="text-xs text-matrix-muted text-center py-8">[AUCUN PROJET ENREGISTRÉ]</p>
                ) : (
                    projects.map((project) => {
                        const isLikedByMe = user && project.project_likes.some(l => l.user_id === user.id);
                        return (
                            <div key={project.id} className="bg-matrix-card border border-matrix-border p-6 space-y-4 shadow-neon">

                                <div className="flex justify-between items-start text-xs text-matrix-muted border-b border-matrix-muted/30 pb-3">
                                    <span className="flex items-center space-x-1 text-matrix-neon">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{project.profiles?.username || 'Admin'}</span>
                                    </span>
                                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                </div>

                                <h3 className="text-lg font-bold text-matrix-text tracking-wide">{project.title}</h3>

                                {/* Tech Stack Badges */}
                                {project.tech_stack && project.tech_stack.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {project.tech_stack.map((tech, i) => (
                                            <span key={i} className="bg-matrix-bg border border-matrix-muted px-2.5 py-0.5 text-[10px] text-matrix-neon flex items-center space-x-1">
                                                <Code className="w-3 h-3 inline mr-1" />
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-matrix-text/80 whitespace-pre-line leading-relaxed">{project.description}</p>

                                {/* Liens externes */}
                                {(project.github_url || project.live_url) && (
                                    <div className="flex space-x-4 pt-2 text-xs">
                                        {project.github_url && (
                                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-matrix-neon hover:underline">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span>Code Source (GitHub)</span>
                                            </a>
                                        )}
                                        {project.live_url && (
                                            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-matrix-neon hover:underline">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span>Démo Live</span>
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Likes et Commentaires Bar */}
                                <div className="flex items-center space-x-6 pt-3 border-t border-matrix-muted/30 text-xs">
                                    <button
                                        onClick={() => handleToggleLike(project)}
                                        className={`flex items-center space-x-1.5 transition-colors ${isLikedByMe ? 'text-red-500' : 'text-matrix-muted hover:text-matrix-neon'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-red-500' : ''}`} />
                                        <span>{project.project_likes.length} LIKES</span>
                                    </button>

                                    <div className="flex items-center space-x-1.5 text-matrix-muted">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{project.project_comments.length} COMMENTAIRES</span>
                                    </div>
                                </div>

                                {/* Section Commentaires */}
                                <div className="space-y-3 pt-3 border-t border-dashed border-matrix-muted/40">
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {project.project_comments.map((comment) => (
                                            <div key={comment.id} className="bg-matrix-bg p-2.5 border border-matrix-muted/50 text-xs space-y-1">
                                                <div className="flex justify-between text-[10px] text-matrix-muted">
                                                    <span className="text-matrix-neon font-bold">{comment.profiles?.username || 'Agent'}</span>
                                                    <span>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-matrix-text">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {user ? (
                                        <div className="flex space-x-2 pt-2">
                                            <input
                                                type="text"
                                                value={commentInputs[project.id] || ''}
                                                onChange={(e) => setCommentInputs({ ...commentInputs, [project.id]: e.target.value })}
                                                placeholder="Laisser un commentaire sur ce projet..."
                                                className="flex-1 bg-matrix-bg border border-matrix-muted px-3 py-1.5 text-xs text-matrix-text focus:border-matrix-neon outline-none"
                                            />
                                            <MatrixButton onClick={() => handleAddComment(project.id)}>
                                                <Send className="w-3.5 h-3.5" />
                                            </MatrixButton>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-matrix-muted italic text-center">[Connectez-vous pour commenter ce projet]</p>
                                    )}
                                </div>

                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
};