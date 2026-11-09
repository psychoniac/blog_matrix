import { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MatrixButton } from './MatrixButton';
import { supabase } from '../../services/supabaseClient';

export const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [socials, setSocials] = useState({ github: '', twitter: '', linkedin: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                // Inscription avec métadonnées additionnelles pour le profil
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username,
                        }
                    }
                });
                if (signUpError) throw signUpError;

                // Si l'utilisateur est créé, on met à jour les infos optionnelles dans la table profiles
                if (data?.user) {
                    await supabase.from('profiles').update({
                        gender: gender || null,
                        age: age ? parseInt(age) : null,
                        socials: socials
                    }).eq('id', data.user.id);
                }
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-matrix-card border border-matrix-border w-full max-w-md p-6 relative shadow-neon">

                {/* Bouton de fermeture */}
                <button onClick={onClose} className="absolute top-4 right-4 text-matrix-muted hover:text-matrix-neon">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2 mb-6">
                    <ShieldCheck className="w-6 h-6 text-matrix-neon" />
                    <h2 className="text-lg font-mono font-bold text-matrix-neon uppercase tracking-wider">
                        {isLogin ? 'AUTH_SYSTEM // CONNEXION' : 'NEW_AGENT // ENREGISTREMENT'}
                    </h2>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-950/50 border border-red-600 text-red-300 text-xs font-mono">
                        [ERREUR] : {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">

                    {!isLogin && (
                        <div>
                            <label className="block text-matrix-text mb-1">PSEUDO (OBLIGATOIRE) *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-matrix-muted" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Neo_Coder"
                                    className="w-full bg-matrix-bg border border-matrix-muted pl-10 pr-3 py-2 text-matrix-text focus:border-matrix-neon outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-matrix-text mb-1">EMAIL (OBLIGATOIRE) *</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-matrix-muted" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="agent@zion.net"
                                className="w-full bg-matrix-bg border border-matrix-muted pl-10 pr-3 py-2 text-matrix-text focus:border-matrix-neon outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-matrix-text mb-1">PASSWORD (OBLIGATOIRE) *</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-matrix-muted" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-matrix-bg border border-matrix-muted pl-10 pr-3 py-2 text-matrix-text focus:border-matrix-neon outline-none"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-matrix-text mb-1">GENRE (FACULTATIF)</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text focus:border-matrix-neon outline-none"
                                    >
                                        <option value="">Non spécifié</option>
                                        <option value="male">Masculin</option>
                                        <option value="female">Féminin</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-matrix-text mb-1">ÂGE (FACULTATIF)</label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="28"
                                        className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text focus:border-matrix-neon outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-matrix-text mb-1">GITHUB / RESEAUX (FACULTATIF)</label>
                                <input
                                    type="text"
                                    value={socials.github}
                                    onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                                    placeholder="Lien profil GitHub ou Twitter"
                                    className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-matrix-text focus:border-matrix-neon outline-none"
                                />
                            </div>
                        </>
                    )}

                    <div className="pt-4 flex flex-col space-y-3">
                        <MatrixButton type="submit" className="w-full justify-center">
                            {loading ? 'TRAITEMENT...' : (signIn ? 'SE CONNECTER' : 'INITIALISER LE COMPTE')}
                        </MatrixButton>

                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-center text-matrix-muted hover:text-matrix-neon transition-colors"
                        >
                            {isLogin ? "Pas encore de compte ? S'enregistrer" : "Déjà un compte ? Se connecter"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};