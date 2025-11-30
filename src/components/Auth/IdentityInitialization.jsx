import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Smartphone, Apple, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import './Auth.css';

const IdentityInitialization = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSocialLogin = async (provider) => {
        if (!supabase) {
            alert("Supabase not configured! Check environment variables.");
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

        if (!supabase) {
            alert("Supabase not configured! Check environment variables.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });
            if (error) throw error;
            setSent(true);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="scan-line"></div>

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="auth-title">Identity Initialization</h1>
                    <p className="auth-subtitle">Establish connection to the Optimal Protocol network.</p>
                    {window.location.hostname === 'localhost' && (
                        <div style={{ fontSize: '0.75rem', color: '#ffaa00', marginTop: '1rem', background: 'rgba(255, 170, 0, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 170, 0, 0.3)', textAlign: 'left' }}>
                            <strong>⚠️ MOBILE LOGIN ISSUE DETECTED</strong>
                            <ul style={{ margin: '0.5rem 0 0 1.2rem', lineHeight: '1.4' }}>
                                <li>You are on <code>localhost</code>. Links sent from here point to localhost.</li>
                                <li>Your phone cannot open localhost.</li>
                                <li><b>FIX:</b> Open this app on your computer using your <b>Network IP</b> (e.g., <code>192.168.x.x:5173</code>) instead of localhost.</li>
                                <li>Then request the link again.</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="social-buttons">
                    <button className="social-btn" onClick={() => handleSocialLogin('google')}>
                        <Chrome size={20} />
                        Continue with Google
                    </button>
                    {/* Apple login often requires more setup, but including for UI completeness */}
                    <button className="social-btn" onClick={() => handleSocialLogin('apple')}>
                        <Apple size={20} />
                        Continue with Apple
                    </button>
                </div>

                <div className="divider">OR</div>

                {sent ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="success-message"
                    >
                        <Mail size={48} color="#39FF14" style={{ margin: '0 auto 1rem' }} />
                        <h3>Link Sent!</h3>
                        <p style={{ color: '#888' }}>Check your email ({email}) for the magic link to sign in.</p>
                        <button
                            className="text-btn"
                            onClick={() => setSent(false)}
                            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            Try different email
                        </button>
                    </motion.div>
                ) : (
                    <form className="email-input-group" onSubmit={handleMagicLink}>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="magic-btn"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Magic Link'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>By initializing, you accept the Protocol Terms.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default IdentityInitialization;
