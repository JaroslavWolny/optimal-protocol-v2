import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Chrome, Apple, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import './Auth.css';

const IdentityInitialization = () => {
    const [email, setEmail] = useState('');
    const [manualLink, setManualLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // Auto-detect redirect URL with override support
    const getRedirectUrl = () => {
        // 1. Check for explicit environment variable override (Crucial for Mobile/Capacitor)
        if (import.meta.env.VITE_REDIRECT_URL) return import.meta.env.VITE_REDIRECT_URL;
        if (import.meta.env.VITE_SITE_URL) return import.meta.env.VITE_SITE_URL;

        // 2. Default to current origin
        return window.location.origin;
    };

    useEffect(() => {
        console.log("IdentityInitialization: Using Redirect URL ->", getRedirectUrl());
    }, []);

    const handleSocialLogin = async (provider) => {
        setErrorMsg(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: getRedirectUrl(),
                }
            });
            if (error) throw error;
        } catch (error) {
            setErrorMsg(error.message);
        }
    };

    const handleMagicLink = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const redirectUrl = getRedirectUrl();
            console.log("Sending Magic Link to:", email, "Redirect:", redirectUrl);

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: redirectUrl
                },
            });
            if (error) throw error;
            setSent(true);
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleManualLogin = async () => {
        if (!manualLink) {
            setErrorMsg("Please paste the full link.");
            return;
        }

        try {
            setLoading(true);
            setErrorMsg(null);
            console.log("Processing Manual Link...");

            // Robust Hash/Query Parsing
            let paramsString = manualLink;
            if (manualLink.includes('#')) {
                paramsString = manualLink.split('#')[1];
            } else if (manualLink.includes('?')) {
                paramsString = manualLink.split('?')[1];
            }

            const params = new URLSearchParams(paramsString);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (!accessToken || !refreshToken) {
                throw new Error("Invalid Link. Missing tokens. Ensure you copied the entire URL.");
            }

            const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (error) throw error;

            // Success is handled by the onAuthStateChange listener in App/Context

        } catch (error) {
            console.error(error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="scan-line"></div>
            <motion.div className="auth-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div>
                    <h1 className="auth-title">IDENTITY INITIALIZATION</h1>
                    <p className="auth-subtitle">ESTABLISH NEURAL LINK</p>
                </div>

                {errorMsg && (
                    <div className="auth-error" style={{
                        background: 'rgba(255, 0, 60, 0.2)',
                        border: '1px solid #FF003C',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        color: '#FF003C',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AlertTriangle size={16} />
                        {errorMsg}
                    </div>
                )}

                {!sent ? (
                    <>
                        <div className="social-buttons">
                            <button className="social-btn" onClick={() => handleSocialLogin('google')}>
                                <Chrome size={20} />
                                GOOGLE
                            </button>
                            <button className="social-btn" onClick={() => handleSocialLogin('apple')}>
                                <Apple size={20} />
                                APPLE
                            </button>
                        </div>

                        <div className="divider">OR EMAIL LINK</div>

                        <form className="email-input-group" onSubmit={handleMagicLink}>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="ENTER EMAIL ADDRESS"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="magic-btn" disabled={loading}>
                                {loading ? 'TRANSMITTING...' : 'SEND MAGIC LINK'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-message">
                        <Mail size={48} color="#39FF14" style={{ margin: '0 auto 1rem' }} />
                        <h3>LINK TRANSMITTED</h3>
                        <p style={{ color: '#888', marginBottom: '1rem' }}>Target: {email}</p>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
                            <p style={{ fontSize: '0.8rem', color: '#39FF14', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                ⚠️ MOBILE / PWA OVERRIDE:
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.8rem' }}>
                                If the link fails to open the app:
                                <br />1. Copy the link from email.
                                <br />2. Paste it below to force authentication.
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="auth-input"
                                    style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}
                                    placeholder="PASTE LINK HERE..."
                                    value={manualLink}
                                    onChange={(e) => setManualLink(e.target.value)}
                                />
                                <button
                                    onClick={handleManualLogin}
                                    className="glass-button"
                                    style={{ padding: '0 12px', background: '#39FF14', color: 'black', border: 'none' }}
                                    disabled={loading}
                                >
                                    <LinkIcon size={18} />
                                </button>
                            </div>
                        </div>

                        <button className="text-btn" onClick={() => setSent(false)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#666' }}>
                            ABORT
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default IdentityInitialization;
