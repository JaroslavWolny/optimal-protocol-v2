import React, { forwardRef, useState, useEffect } from 'react';
import './ProofHUD.css';
import { Crosshair, Battery, Wifi, Activity, Zap } from 'lucide-react';

const ProofHUD = forwardRef(({ streak, image, stats }, ref) => {
    const [time, setTime] = useState(new Date());

    // Fake running timecode
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    };

    // Determine Status based on streak/stats
    let status = "OPTIMAL";
    let statusColor = "#39FF14"; // Green

    if (streak > 30) {
        status = "GODLIKE";
        statusColor = "#FFD700"; // Gold
    } else if (streak > 7) {
        status = "ELITE";
        statusColor = "#39D1FF"; // Cyan
    }

    return (
        <div ref={ref} className="proof-hud-container">
            {/* Background Image */}
            {image && <img src={image} alt="Proof" className="proof-bg-image" />}
            {!image && <div className="proof-bg-placeholder">NO SIGNAL</div>}

            {/* HUD Overlay Layer */}
            <div className="hud-overlay">

                {/* --- TOP BAR --- */}
                <div className="hud-top-bar">
                    <div className="hud-group left">
                        <div className="rec-indicator">
                            <div className="rec-dot"></div> REC
                        </div>
                        <div className="hud-time">{formatTime(time)}</div>
                    </div>

                    <div className="hud-group center">
                        <div className="compass-ticks">
                            <span>|</span><span>|</span><span>|</span><span className="active">▼</span><span>|</span><span>|</span><span>|</span>
                        </div>
                    </div>

                    <div className="hud-group right">
                        <Wifi size={20} />
                        <Battery size={20} />
                        <span>100%</span>
                    </div>
                </div>

                {/* --- CROSSHAIRS & GRID --- */}
                <div className="hud-crosshair-center">
                    <Crosshair size={40} strokeWidth={1} />
                </div>

                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>

                {/* --- DATA READOUTS --- */}

                {/* Left: Biometrics */}
                <div className="hud-panel left-panel">
                    <div className="hud-row">
                        <Activity size={18} color={statusColor} />
                        <span className="hud-label">HR:</span>
                        <span className="hud-value">{110 + Math.floor(Math.random() * 20)} BPM</span>
                    </div>
                    <div className="hud-row">
                        <Zap size={18} color={statusColor} />
                        <span className="hud-label">ENERGY:</span>
                        <span className="hud-value">OPTIMAL</span>
                    </div>
                    <div className="hud-row">
                        <span className="hud-label">DATE:</span>
                        <span className="hud-value">{formatDate(time)}</span>
                    </div>
                </div>

                {/* Right: Protocol Status */}
                <div className="hud-panel right-panel">
                    <div className="hud-big-stat">
                        <span className="stat-label">CURRENT STREAK</span>
                        <span className="stat-number" style={{ color: statusColor }}>{streak}</span>
                        <span className="stat-unit">DAYS</span>
                    </div>
                </div>

                {/* --- BOTTOM BAR --- */}
                <div className="hud-bottom-bar">
                    <div className="hud-brand">
                        <span className="brand-main">OPTIMAL PROTOCOL</span>
                        <span className="brand-sub">// VERIFIED USER</span>
                    </div>
                    <div className="hud-status" style={{ borderColor: statusColor, color: statusColor }}>
                        STATUS: {status}
                    </div>
                </div>

                {/* Scanlines / Noise */}
                <div className="scanlines"></div>
                <div className="vignette"></div>
            </div>
        </div>
    );
});

export default ProofHUD;
