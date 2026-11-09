import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { MatrixButton } from '../common/MatrixButton';
import { BookOpen, Heart, MessageSquare, PlusCircle, Send, User } from 'lucide-react';

export const BlogSection = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showNewPostForm, setShowNewPostForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [commentInputs, setCommentInputs] = useState({});
    const [loading, setLoading] = useState(false);

    // Vérifier si l'utilisateur connecté est administrateur
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

    // Charger les articles avec leurs likes et commentaires associés
    const fetchPosts = async () => {
        const { data: postsData, error } = await supabase
            .from('posts')
            .select(`
        *,
        profiles:author_id (username),
        post_likes (id, user_id),
        post_comments (
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (username)
        )
      `)
            .order('created_at', { ascending: false });

        if (!error && postsData) {
            setPosts(postsData);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Publier un nouvel article (Admin uniquement)
    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        setLoading(true);
        const { error } = await supabase.from('posts').insert([
            { title: newTitle, content: newContent, author_id: user.id }
        ]);

        if (!error) {
            setNewTitle('');
            setNewContent('');
            setShowNewPostForm(false);
            fetchPosts();
        }
        setLoading(false);
    };

    // Gérer le Like / Unlike d'un article
    const handleToggleLike = async (post) => {
        if (!user) return alert('Connectez-vous pour liker ce post.');

        const existingLike = post.post_likes.find(l => l.user_id === user.id);

        if (existingLike) {
            await supabase.from('post_likes').delete().eq('id', existingLike.id);
        } else {
            await supabase.from('post_likes').insert([{ post_id: post.id, user_id: user.id }]);
        }
        fetchPosts();
    };

    // Ajouter un commentaire
    const handleAddComment = async (postId) => {
        const commentText = commentInputs[postId];
        if (!commentText?.trim() || !user) return;

        const { error } = await supabase.from('post_comments').insert([
            { post_id: postId, user_id: user.id, content: commentText }
        ]);

        if (!error) {
            setCommentInputs({ ...commentInputs, [postId]: '' });
            fetchPosts();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 font-mono">

            {/* En-tête de section */}
            <div className="flex items-center justify-between border-b border-matrix-border pb-4">
                <div className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-matrix-neon" />
                    <h2 className="text-xl font-bold text-matrix-neon tracking-wider uppercase">
                        DATABASE_BLOG // JOURNAL DE BORD
                    </h2>
                </div>
                {isAdmin && (
                    <MatrixButton onClick={() => setShowNewPostForm(!showNewPostForm)}>
                        <PlusCircle className="w-4 h-4 inline mr-2" />
                        {showNewPostForm ? 'Annuler' : 'Nouvel Article'}
                    </MatrixButton>
                )}
            </div>

            {/* Formulaire de création (Admin) */}
            {showNewPostForm && isAdmin && (
                <form onSubmit={handleCreatePost} className="bg-matrix-card border border-matrix-border p-5 space-y-4 shadow-neon">
                    <h3 className="text-sm font-bold text-matrix-neon uppercase">[NOUVELLE_ENTRÉE_DATABASE]</h3>
                    <div>
                        <label className="block text-xs text-matrix-text mb-1">TITRE DE L'ARTICLE</label>
                        <input
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Ex: Architecture micro-services sous React..."
                            className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text text-xs focus:border-matrix-neon outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-matrix-text mb-1">CONTENU</label>
                        <textarea
                            rows="5"
                            required
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Rédigez votre article ici..."
                            className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text text-xs focus:border-matrix-neon outline-none resize-none"
                        />
                    </div>
                    <MatrixButton type="submit">
                        {loading ? 'PUBLICATION...' : 'DIFFUSER DANS LE RESEAU'}
                    </MatrixButton>
                </form>
            )}

            {/* Liste des articles */}
            <div className="space-y-6">
                {posts.length === 0 ? (
                    <p className="text-xs text-matrix-muted text-center py-8">[AUCUN ARTICLE TROUVÉ DANS LA BASE]</p>
                ) : (
                    posts.map((post) => {
                        const isLikedByMe = user && post.post_likes.some(l => l.user_id === user.id);
                        return (
                            <article key={post.id} className="bg-matrix-card border border-matrix-border p-6 space-y-4 shadow-neon">

                                <div className="flex justify-between items-start text-xs text-matrix-muted border-b border-matrix-muted/30 pb-3">
                                    <span className="flex items-center space-x-1 text-matrix-neon">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{post.profiles?.username || 'Anonyme'}</span>
                                    </span>
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>

                                <h3 className="text-lg font-bold text-matrix-text tracking-wide">{post.title}</h3>
                                <p className="text-xs text-matrix-text/80 whitespace-pre-line leading-relaxed">{post.content}</p>

                                {/* Barre d'interactions (Likes & Compteurs) */}
                                <div className="flex items-center space-x-6 pt-3 border-t border-matrix-muted/30 text-xs">
                                    <button
                                        onClick={() => handleToggleLike(post)}
                                        className={`flex items-center space-x-1.5 transition-colors ${isLikedByMe ? 'text-red-500' : 'text-matrix-muted hover:text-matrix-neon'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-red-500' : ''}`} />
                                        <span>{post.post_likes.length} LIKES</span>
                                    </button>

                                    <div className="flex items-center space-x-1.5 text-matrix-muted">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{post.post_comments.length} COMMENTAIRES</span>
                                    </div>
                                </div>

                                {/* Section Commentaires */}
                                <div className="space-y-3 pt-3 border-t border-dashed border-matrix-muted/40">
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {post.post_comments.map((comment) => (
                                            <div key={comment.id} className="bg-matrix-bg p-2.5 border border-matrix-muted/50 text-xs space-y-1">
                                                <div className="flex justify-between text-[10px] text-matrix-muted">
                                                    <span className="text-matrix-neon font-bold">{comment.profiles?.username || 'Agent'}</span>
                                                    <span>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-matrix-text">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input nouveau commentaire */}
                                    {user ? (
                                        <div className="flex space-x-2 pt-2">
                                            <input
                                                type="text"
                                                value={commentInputs[post.id] || ''}
                                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                                placeholder="Écrire un commentaire..."
                                                className="flex-1 bg-matrix-bg border border-matrix-muted px-3 py-1.5 text-xs text-matrix-text focus:border-matrix-neon outline-none"
                                            />
                                            <MatrixButton onClick={() => handleAddComment(post.id)}>
                                                <Send className="w-3.5 h-3.5" />
                                            </MatrixButton>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-matrix-muted italic text-center">[Connectez-vous pour participer aux discussions]</p>
                                    )}
                                </div>

                            </article>
                        );
                    })
                )}
            </div>

        </div>
    );
};