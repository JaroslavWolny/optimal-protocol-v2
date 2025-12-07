import React, { forwardRef } from 'react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits, avatarImage }, ref) => {
    // 1. Calculations
    const totalHabits = habits.length;
    const completedToday = todayHabits.filter(h => h.completed).length;
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) : 0;

    // Power Level Logic
    const basePower = 1000;
    const streakBonus = streak * 800;
    const dailyBonus = completedToday * 500;
    let powerLevel = basePower + streakBonus + dailyBonus;
    if (completionRate === 1) powerLevel = Math.round(powerLevel * 1.2);

    // Stats Logic
    const getCatRate = (cat) => {
        const catHabits = todayHabits.filter(h => (h.category || 'training') === cat);
        if (catHabits.length === 0) return 0;
        return catHabits.filter(h => h.completed).length / catHabits.length;
    };
    const str = Math.round(getCatRate('training') * 99);
    const dis = Math.round(((completionRate + (Math.min(streak, 30) / 30)) / 2) * 99);
    const teq = Math.round(((getCatRate('knowledge') + getCatRate('recovery') + getCatRate('nutrition')) / 3) * 99);

    // 2. Dynamic Theme
    let statusTitle = 'INITIATE';
    let statusColor = '#ff6b6b';
    if (powerLevel > 9000) { statusTitle = 'GODLIKE'; statusColor = '#39FF14'; }
    else if (powerLevel > 5000) { statusTitle = 'ELITE'; statusColor = '#39D1FF'; }
    else if (powerLevel > 2000) { statusTitle = 'OPERATIVE'; statusColor = '#FFD139'; }

    return (
        <div ref={ref} className="share-card-v3">
            {/* Background Layers */}
            <div className="sc-noise"></div>
            <div className="sc-grid-overlay"></div>
            <div className="sc-vignette"></div>

            {/* Top Badge */}
            <div className="sc-header">
                <div className="sc-brand">
                    <span className="sc-logo-icon">⚡</span> OPTIMAL PROTOCOL
                </div>
                <div className="sc-date">{new Date().toLocaleDateString().toUpperCase()}</div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="sc-content">

                {/* Left Col: Avatar & Identity */}
                <div className="sc-avatar-frame" style={{ borderColor: statusColor }}>
                    <div className="sc-corner-brackets"></div>
                    {avatarImage ? (
                        <img src={avatarImage} className="sc-avatar-img" alt="Operative Avatar" />
                    ) : (
                        <div className="sc-avatar-placeholder">INITIALIZING...</div>
                    )}
                    <div className="sc-scan-line"></div>

                    <div className="sc-rank-badge" style={{ background: statusColor }}>
                        {statusTitle}
                    </div>
                </div>

                {/* Right Col: Data Stream */}
                <div className="sc-data-column">
                    <div className="sc-power-block">
                        <div className="sc-label-tiny">POWER LEVEL</div>
                        <div className="sc-power-val" style={{ color: statusColor, textShadow: `0 0 30px ${statusColor}` }}>
                            {powerLevel.toLocaleString()}
                        </div>
                    </div>

                    <div className="sc-stat-grid">
                        <StatRow label="STRENGTH" val={str} color="#ff003c" />
                        <StatRow label="DISCIPLINE" val={dis} color="#39D1FF" />
                        <StatRow label="INTELLECT" val={teq} color="#FFD139" />
                    </div>

                    <div className="sc-streak-block">
                        <div className="sc-streak-num">{streak}</div>
                        <div className="sc-streak-label">DAY STREAK</div>
                    </div>
                </div>
            </div>

            {/* FOOTER: CTA */}
            <div className="sc-footer">
                <div className="sc-quote">"WEAKNESS IS A CHOICE."</div>
                <div className="sc-qr-container">
                    <div className="sc-qr-text">
                        <span>JOIN THE</span>
                        <span style={{ color: statusColor }}>PROTOCOL</span>
                    </div>
                    {/* Placeholder QR - v produkci dynamický odkaz */}
                    <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://optimalprotocol.app&color=ffffff&bgcolor=000000"
                        className="sc-qr-code"
                        alt="Join"
                    />
                </div>
            </div>
        </div>
    );
});

const StatRow = ({ label, val, color }) => (
    <div className="sc-stat-row">
        <div className="sc-stat-name">{label}</div>
        <div className="sc-stat-bar-bg">
            <div className="sc-stat-bar-fill" style={{ width: `${val}%`, background: color, boxShadow: `0 0 10px ${color}` }}></div>
        </div>
        <div className="sc-stat-num">{val}</div>
    </div>
);

export default ShareCard;
