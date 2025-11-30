import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Chrome, Apple, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import './Auth.css';

const IdentityInitialization = () => {
    const [email, setEmail] = useState('');
    const [manualLink, setManualLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSocialLogin = async (provider) => {
        if (!supabase) {
            alert("Supabase not configured!");
            return;
        }
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
            });
            if (error) throw error;
        } catch (error) {
            alert(error.message);
        }
    };

    const handleMagicLink = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            // Ujisti se, že tady máš svou aktuální IP a Port (např. 5174 nebo 5173)
            const redirectUrl = 'http://192.168.0.182:5174';
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: redirectUrl },
            });
            if (error) throw error;
            setSent(true);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- TOTO JE TA OPRAVENÁ FUNKCE ---
    const handleManualLogin = async () => {
        if (!manualLink) {
            alert("Prosím vlož odkaz do políčka.");
            return;
        }

        try {
            setLoading(true);
            console.log("Zpracovávám odkaz:", manualLink);

            // 1. Získáme jen tu část s parametry (všechno za # nebo ?)
            let paramsString = manualLink;
            if (manualLink.includes('#')) {
                paramsString = manualLink.split('#')[1];
            } else if (manualLink.includes('?')) {
                paramsString = manualLink.split('?')[1];
            }

            // 2. Vytáhneme tokeny
            const params = new URLSearchParams(paramsString);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (!accessToken || !refreshToken) {
                throw new Error("V odkazu chybí přihlašovací údaje (tokeny).\n\nZkus zkopírovat odkaz z e-mailu znovu a ujisti se, že je celý.");
            }

            // 3. Pokusíme se nastavit session
            const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (error) throw error;

            // Úspěch! App.jsx to samo pozná a přepne obrazovku.
            alert("✅ Úspěšně ověřeno! Vítej.");

        } catch (error) {
            console.error(error);
            alert("❌ CHYBA PŘIHLÁŠENÍ:\n" + error.message);
        } finally {
            setLoading(false);
        }
    };
    // ----------------------------------

    return (
        <div className="auth-container">
            <div className="scan-line"></div>
            <motion.div className="auth-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div>
                    <h1 className="auth-title">Identity Initialization</h1>
                    <p className="auth-subtitle">Establish connection.</p>
                </div>

                {!sent ? (
                    <>
                        <div className="social-buttons">
                            <button className="social-btn" onClick={() => handleSocialLogin('google')}>
                                <Chrome size={20} />
                                Continue with Google
                            </button>
                            <button className="social-btn" onClick={() => handleSocialLogin('apple')}>
                                <Apple size={20} />
                                Continue with Apple
                            </button>
                        </div>

                        <div className="divider">OR</div>

                        <form className="email-input-group" onSubmit={handleMagicLink}>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="magic-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Magic Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-message">
                        <Mail size={48} color="#39FF14" style={{ margin: '0 auto 1rem' }} />
                        <h3>Link Sent!</h3>
                        <p style={{ color: '#888', marginBottom: '1rem' }}>Check {email}</p>

                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                            <p style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                📲 FIX PRO PWA / MOBIL:
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#ccc', marginBottom: '0.8rem' }}>
                                1. Jdi do mailu.<br />
                                2. Podrž prst na tlačítku "Log In".<br />
                                3. Zvol "Kopírovat odkaz" (Copy Link).<br />
                                4. Vlož ho sem a klikni na ikonu řetězu.
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="auth-input"
                                    style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}
                                    placeholder="Sem vlož zkopírovaný odkaz..."
                                    value={manualLink}
                                    onChange={(e) => setManualLink(e.target.value)}
                                />
                                <button
                                    onClick={handleManualLogin}
                                    className="glass-button"
                                    style={{ padding: '0 12px', background: '#39FF14', color: 'black', border: 'none' }}
                                >
                                    <LinkIcon size={18} />
                                </button>
                            </div>
                        </div>

                        <button className="text-btn" onClick={() => setSent(false)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#666' }}>
                            Zpět
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default IdentityInitialization;
