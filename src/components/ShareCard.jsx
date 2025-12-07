import React, { forwardRef } from 'react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits, avatarImage }, ref) => {
    // 1. Calculations
    const totalHabits = habits.length;
    const completedToday = todayHabits.filter(h => h.completed).length;
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) : 0;

    // Power Level
    const basePower = 1000;
    const streakBonus = streak * 800;
    const dailyBonus = completionRate * 500;
    let powerLevel = Math.round(basePower + streakBonus + dailyBonus);

    // Stats
    const getCatRate = (cat) => {
        const catHabits = todayHabits.filter(h => (h.category || 'training') === cat);
        if (catHabits.length === 0) return 0;
        return catHabits.filter(h => h.completed).length / catHabits.length;
    };
    const str = Math.round(getCatRate('training') * 100);
    const dis = Math.round(((completionRate + (Math.min(streak, 30) / 30)) / 2) * 100);
    const teq = Math.round(((getCatRate('knowledge') + getCatRate('recovery') + getCatRate('nutrition')) / 3) * 100);

    // Theme Logic
    let themeColor = '#ff4757'; // Default Red
    let tierName = 'ROOKIE';

    if (streak > 50) { themeColor = '#39FF14'; tierName = 'GODLIKE'; } // Neon Green
    else if (streak > 20) { themeColor = '#2ed573'; tierName = 'ELITE'; } // Green
    else if (streak > 10) { themeColor = '#ffa502'; tierName = 'PRO'; } // Orange
    else if (streak > 3) { themeColor = '#1e90ff'; tierName = 'SOLDIER'; } // Blue

    return (
        <div ref={ref} className="share-card-modern" style={{ '--theme-color': themeColor }}>

            {/* 1. HERO IMAGE LAYER (Background) */}
            <div className="mc-hero-layer">
                {avatarImage ? (
                    <img src={avatarImage} className="mc-avatar-bg" alt="Avatar" />
                ) : (
                    <div className="mc-avatar-placeholder" />
                )}
                <div className="mc-gradient-overlay"></div>
            </div>

            {/* 2. CONTENT LAYER */}
            <div className="mc-content">

                {/* Header Badge */}
                <div className="mc-header">
                    <div className="mc-brand-pill">
                        <span className="mc-icon">⚡</span> OPTIMAL
                    </div>
                    <div className="mc-date">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}</div>
                </div>

                {/* Main Text (Big Flex) */}
                <div className="mc-main-stat">
                    <div className="mc-streak-val">{streak}</div>
                    <div className="mc-streak-label">DAY STREAK</div>
                </div>

                {/* Glass Card Info */}
                <div className="mc-stats-card glass-panel-clean">
                    <div className="mc-tier-row">
                        <span className="mc-tier-label">STATUS</span>
                        <span className="mc-tier-val" style={{ color: themeColor }}>{tierName}</span>
                    </div>

                    <div className="mc-separator"></div>

                    <div className="mc-grid-row">
                        <div className="mc-stat-item">
                            <div className="mc-stat-num">{str}%</div>
                            <div className="mc-stat-name">STR</div>
                        </div>
                        <div className="mc-stat-item">
                            <div className="mc-stat-num">{dis}%</div>
                            <div className="mc-stat-name">DIS</div>
                        </div>
                        <div className="mc-stat-item">
                            <div className="mc-stat-num">{teq}%</div>
                            <div className="mc-stat-name">TEQ</div>
                        </div>
                    </div>

                    <div className="mc-power-row">
                        <span>POWER LVL</span>
                        <strong>{powerLevel.toLocaleString()}</strong>
                    </div>
                </div>

            </div>

            {/* 3. FOOTER */}
            <div className="mc-footer">
                <div className="mc-cta">
                    <p>CAN YOU BEAT ME?</p>
                    <p className="mc-sub">Download Optimal Protocol</p>
                </div>
                <div className="mc-qr-box">
                    <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://optimalprotocol.app&color=000000&bgcolor=ffffff&margin=0"
                        alt="Join"
                    />
                </div>
            </div>
        </div>
    );
});

export default ShareCard;
