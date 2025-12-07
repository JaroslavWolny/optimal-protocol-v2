import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits, avatarImage }, ref) => {
    // 1. Calculations
    const totalHabits = habits.length;
    const completedToday = todayHabits.filter(h => h.completed).length;
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) : 0;

    // Power Level Logic
    const basePower = 1000;
    const streakBonus = streak * 800;
    const dailyBonus = completionRate * 500;
    let powerLevel = Math.round(basePower + streakBonus + dailyBonus);

    // Stats Logic
    const getCatRate = (cat) => {
        const catHabits = todayHabits.filter(h => (h.category || 'training') === cat);
        if (catHabits.length === 0) return 0;
        return catHabits.filter(h => h.completed).length / catHabits.length;
    };
    const str = Math.round(getCatRate('training') * 100);
    const dis = Math.round(((completionRate + (Math.min(streak, 30) / 30)) / 2) * 100);
    const teq = Math.round(((getCatRate('knowledge') + getCatRate('recovery') + getCatRate('nutrition')) / 3) * 100);

    // 2. Dynamic Theme
    let statusTitle = 'INITIATE';
    let statusColor = '#ff6b6b';
    if (powerLevel > 9000) { statusTitle = 'GODLIKE'; statusColor = '#39FF14'; }
    else if (powerLevel > 5000) { statusTitle = 'ELITE'; statusColor = '#39D1FF'; }
    else if (powerLevel > 2000) { statusTitle = 'OPERATIVE'; statusColor = '#FFD139'; }

    return (
        <div ref={ref} className="share-card-poster" style={{
            '--theme-color': statusColor,
            '--theme-glow': statusColor === '#39FF14' ? 'rgba(57, 255, 20, 0.6)' : 'rgba(255, 107, 107, 0.4)'
        }}>
            {/* NOISE & TEXTURE OVERLAY */}
            <div className="poster-texture"></div>

            {/* 1. BACKGROUND / AVATAR LAYER */}
            <div className="poster-bg">
                {avatarImage ? (
                    <img src={avatarImage} className="poster-avatar-img" alt="Avatar" />
                ) : (
                    <div className="poster-avatar-placeholder" />
                )}
                {/* Duotone Gradient Map Effect */}
                <div className="poster-gradient-map"></div>
                <div className="poster-vignette"></div>
            </div>

            {/* 2. TYPOGRAPHY LAYER */}
            <div className="poster-content">

                {/* Header */}
                <header className="poster-header">
                    <div className="poster-brand">
                        <span className="poster-icon">⚡</span> OPTIMAL
                    </div>
                    <div className="poster-date">
                        {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()} / 2024
                    </div>
                </header>

                {/* CENTRAL STAT (Massive) */}
                <div className="poster-hero-stat">
                    <div className="poster-big-num">{streak}</div>
                    <div className="poster-big-label">DAY STREAK</div>
                </div>

                {/* INFO GRID */}
                <div className="poster-info-grid">

                    {/* Rank Badge */}
                    <div className="poster-rank-box">
                        <div className="poster-sub-label">CURRENT RANK</div>
                        <div className="poster-rank-val">{statusTitle}</div>
                    </div>

                    {/* Minimal Stats */}
                    <div className="poster-stats-row">
                        <div className="stat-pill">
                            <span className="sp-label">STR</span>
                            <span className="sp-val">{str}</span>
                        </div>
                        <div className="stat-pill">
                            <span className="sp-label">DIS</span>
                            <span className="sp-val">{dis}</span>
                        </div>
                        <div className="stat-pill">
                            <span className="sp-label">TEQ</span>
                            <span className="sp-val">{teq}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. TICKET FOOTER (High Contrast) */}
            <div className="poster-footer">
                <div className="ticket-left">
                    <div className="ticket-title">JOIN THE PROTOCOL</div>
                    <div className="ticket-sub">ESTABLISH YOUR NEURAL LINK</div>
                    <div className="ticket-power">
                        <span>PWR</span> {powerLevel.toLocaleString().replace(/,/g, ' ')}
                    </div>
                </div>

                <div className="ticket-right-group">
                    <div className="ticket-cta-text">
                        <div>SWIPE UP TO JOIN</div>
                        <div style={{ opacity: 0.5 }}>SCAN TO START</div>
                    </div>
                    <div className="ticket-qr-wrapper">
                        <QRCodeSVG
                            value="https://optimalprotocol.app"
                            size={140}
                            className="ticket-qr"
                            fgColor="#000000"
                            bgColor="#ffffff"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ShareCard;
