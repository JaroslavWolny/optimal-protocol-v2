import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { shareElement } from '../utils/shareUtils';
import './DeathCertificate.css';

const DeathCertificate = ({ user, onRespawn }) => {
    const certificateRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleShareAndRespawn = async () => {
        setLoading(true);
        try {
            // 1. Share the Certificate
            const shared = await shareElement(
                certificateRef.current,
                'death-certificate.png',
                'I DIED.',
                `I failed the Optimal Protocol at Level ${user?.avatar_stage || 0}. Shame me. #OptimalProtocol #Failed #WeaknessIsAChoice`
            );

            if (shared) {
                // 2. Respawn Logic
                // Try RPC first
                const { error } = await supabase.rpc('respawn');

                if (error) {
                    console.warn("RPC Respawn failed, trying direct update...", error);
                    // Fallback: Direct Update
                    await supabase.from('profiles').update({
                        status: 'ALIVE',
                        streak: 0,
                        avatar_stage: 0,
                        last_log_date: new Date().toISOString()
                    }).eq('id', user.id);
                }

                // 3. Notify Parent to Refresh
                if (onRespawn) onRespawn();
                else window.location.reload(); // Brute force reload if no handler
            }
        } catch (err) {
            console.error("Respawn failed:", err);
            alert("System Error: Could not process respawn.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="death-overlay">
            <div className="death-certificate" ref={certificateRef}>
                <div className="death-header">CERTIFICATE OF FAILURE</div>
                <div className="death-title">YOU DIED</div>

                <div className="death-details">
                    <div className="death-label">SUBJECT</div>
                    <div className="death-value">{user?.email?.split('@')[0] || 'UNKNOWN'}</div>

                    <div className="death-label">TIME OF DEATH</div>
                    <div className="death-value">{new Date().toLocaleDateString()}</div>

                    <div className="death-label">HIGHEST LEVEL</div>
                    <div className="death-value">{user?.avatar_stage || 0}</div>

                    <div className="death-label">CAUSE</div>
                    <div className="death-value death-cause">WEAKNESS & INCONSISTENCY</div>
                </div>

                <div className="death-footer">
                    OPTIMAL PROTOCOL // HARDCORE DIVISION
                </div>
            </div>

            <div className="death-actions">
                <button
                    className="btn-respawn"
                    onClick={handleShareAndRespawn}
                    disabled={loading}
                >
                    {loading ? 'PROCESSING...' : 'SHARE TO RESPAWN'}
                </button>
                <div className="death-info">
                    You must publicly admit your failure to restart.
                </div>
            </div>
        </div>
    );
};

export default DeathCertificate;
