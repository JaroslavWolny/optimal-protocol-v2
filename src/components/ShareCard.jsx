import React, { forwardRef } from 'react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits, history }, ref) => {
    // 1. Výpočet skóre
    const totalHabits = habits.length;
    const completedToday = todayHabits.filter(h => h.completed).length;
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) : 0;

    // 2. Power Level Logic (DBZ style)
    const basePower = 1000;
    const streakBonus = streak * 800;
    const dailyBonus = completedToday * 500;
    let powerLevel = basePower + streakBonus + dailyBonus;
    if (completionRate === 1) powerLevel = Math.round(powerLevel * 1.2); // 20% Boost for perfection

    // 3. RPG Stats Calculation (0-99)
    const getCatRate = (cat) => {
        const catHabits = todayHabits.filter(h => (h.category || 'training') === cat);
        if (catHabits.length === 0) return 0;
        return catHabits.filter(h => h.completed).length / catHabits.length;
    };

    // STR: Training based
    const strRaw = getCatRate('training');
    const str = Math.round(strRaw * 99);

    // DIS: Consistency/Streak based + Daily completion
    const disRaw = (completionRate + (Math.min(streak, 30) / 30)) / 2;
    const dis = Math.round(disRaw * 99);

    // TEQ: Knowledge + Recovery + Nutrition
    const teqRaw = (getCatRate('knowledge') + getCatRate('recovery') + getCatRate('nutrition')) / 3;
    const teq = Math.round((teqRaw || 0) * 99);


    // 4. Identity System
    let statusTitle = 'ROOKIE';
    let statusColor = '#94a3b8'; // Grey
    let statusGlow = '0 0 0 transparent';
    let subMessage = 'SYSTEM OFFLINE';

    if (powerLevel > 9000) {
        statusTitle = 'GODLIKE';
        statusColor = '#39FF14'; // Neon Green
        statusGlow = '0 0 50px rgba(57, 255, 20, 0.8)';
        subMessage = 'MAXIMUM EFFICIENCY';
    } else if (powerLevel > 5000) {
        statusTitle = 'ELITE';
        statusColor = '#39D1FF'; // Cyan
        statusGlow = '0 0 40px rgba(57, 209, 255, 0.5)';
        subMessage = 'HIGH PERFORMANCE';
    } else if (powerLevel > 2000) {
        statusTitle = 'OPERATIVE';
        statusColor = '#FFD139'; // Gold
        statusGlow = '0 0 30px rgba(255, 209, 57, 0.4)';
        subMessage = 'SYSTEM STABLE';
    } else {
        statusTitle = 'INITIATE';
        statusColor = '#ff6b6b'; // Red
        subMessage = 'LOW ENERGY';
    }

    return (
        <div ref={ref} className="share-card-v2">
            {/* Ambient Background */}
            <div className="bg-noise"></div>
            <div className="bg-gradient"></div>
            <div className="corner-accent top-left" style={{ borderColor: statusColor }}></div>
            <div className="corner-accent bottom-right" style={{ borderColor: statusColor }}></div>

            <div className="card-inner">
                {/* --- HEADER --- */}
                <header className="card-header">
                    <div className="brand-tag">
                        <span className="bolt">⚡</span> OPTIMAL PROTOCOL
                    </div>
                    <div className="date-tag">
                        {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
                    </div>
                </header>

                {/* --- POWER LEVEL (The Flex) --- */}
                <section className="power-section">
                    <div className="power-label">POWER LEVEL</div>
                    <div className="power-value" style={{ color: statusColor, textShadow: statusGlow }}>
                        {powerLevel.toLocaleString()}
                    </div>
                    <div className="pvp-text">
                        "YOU ARE NOT ON MY LEVEL."
                    </div>
                </section>

                {/* --- CHARACTER SHEET (RPG Stats) --- */}
                <section className="rpg-stats-grid">
                    {/* STR */}
                    <div className="rpg-stat-box">
                        <div className="rpg-stat-label">STR</div>
                        <div className="rpg-stat-val">{str}</div>
                        <div className="rpg-bar-bg">
                            <div className="rpg-bar-fill" style={{ width: `${str}%`, background: '#ff003c' }}></div>
                        </div>
                    </div>

                    {/* DIS */}
                    <div className="rpg-stat-box">
                        <div className="rpg-stat-label">DIS</div>
                        <div className="rpg-stat-val">{dis}</div>
                        <div className="rpg-bar-bg">
                            <div className="rpg-bar-fill" style={{ width: `${dis}%`, background: '#39D1FF' }}></div>
                        </div>
                    </div>

                    {/* TEQ */}
                    <div className="rpg-stat-box">
                        <div className="rpg-stat-label">TEQ</div>
                        <div className="rpg-stat-val">{teq}</div>
                        <div className="rpg-bar-bg">
                            <div className="rpg-bar-fill" style={{ width: `${teq}%`, background: '#FFD139' }}></div>
                        </div>
                    </div>
                </section>

                {/* --- IDENTITY --- */}
                <section className="identity-footer">
                    <div className="id-rank" style={{ color: statusColor }}>{statusTitle}</div>
                    <div className="id-streak">
                        <span className="fire-icon">🔥</span> {streak} DAY STREAK
                    </div>
                </section>

                {/* --- VIRAL FOOTER --- */}
                <footer className="card-footer">
                    <div className="footer-content">
                        <div className="cta-text">
                            <h2>COMPARE<br />YOUR STATS</h2>
                            <p>Scan to challenge me</p>
                        </div>
                        <div className="qr-box">
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://optimalapp.com/compare&color=000000&bgcolor=ffffff&margin=0"
                                alt="Challenge Me"
                            />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});

export default ShareCard;
