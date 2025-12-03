import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, Noise, Pixelation, Scanline, Vignette } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import DoomAvatar from './DoomAvatar';
import './BodyWidget.css';

// --- RETRO ENGINE CONFIG ---
const FPS_LIMIT = 12; // Animace postavy poběží jen na 12 FPS (Doom style)

// --- SCENE SETUP ---
const BodyWidget = ({ stats, isPumped = false, streak = 0, hardcoreMode = false }) => {
    const safeStats = stats || { training: 0, nutrition: 0, recovery: 0, knowledge: 0 };
    const integrity = (safeStats.training + safeStats.nutrition + safeStats.recovery + safeStats.knowledge) / 4;
    const isGodMode = integrity >= 0.9 && streak > 30;

    let stage = "ROOKIE";
    if (streak >= 50) stage = "GODLIKE";
    else if (streak >= 10) stage = "OPERATIVE";

    // Dynamic message
    const [message, setMessage] = useState("IDDQD"); // Doom cheat reference :)
    useEffect(() => {
        if (integrity < 0.3) setMessage("CRITICAL HEALTH.");
        else if (integrity < 0.6) setMessage("HURT ME PLENTY.");
        else if (integrity < 0.9) setMessage("ULTRA VIOLENCE.");
        else setMessage("NIGHTMARE MODE.");
    }, [integrity]);

    // Color Logic
    const glowColor = integrity < 0.4 ? '#ff0000' : (isGodMode ? '#ffd700' : '#39FF14');

    return (
        <div className="body-widget-container retro-scanlines">
            <div className="cyber-overlay">
                <div className="status-line" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>
                    <span className="blink-dot" style={{ background: glowColor }}></span>
                    {message}
                </div>
                <div className="energy-bar-wrapper">
                    <div className="energy-label">ARMOR</div>
                    <div className="energy-bar">
                        <div className="energy-fill" style={{ width: `${integrity * 100}%`, background: '#39D1FF' }}></div>
                    </div>
                </div>
            </div>

            <Canvas
                // KABINETNÍ PROJEKCE (Jako v editoru map Doom)
                camera={{ position: [0, 0, 5.0], fov: 50 }}
                gl={{ antialias: false, preserveDrawingBuffer: true }}
                dpr={1} // Zvýšeno pro lepší čitelnost před pixelizací
            >
                <color attach="background" args={['#101010']} /> {/* Trochu světlejší pozadí */}

                {/* Lighting - High Contrast Doom Style - ZESVĚTLENO */}
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 5, 5]} intensity={3.0} castShadow />
                <pointLight position={[-5, 2, 5]} intensity={1.0} color="#4444ff" distance={10} /> {/* Fill light */}
                <pointLight position={[0, 0, 3]} intensity={0.8} color={glowColor} distance={5} />

                {/* Environment - Simple Grid */}
                <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -2.5, 0]} />

                <DoomAvatar stats={safeStats} integrity={integrity} stage={stage} hardcoreMode={hardcoreMode} />

                {/* POST PROCESSING - THE RETRO MAGIC */}
                <EffectComposer disableNormalPass>
                    {/* 1. Pixelation - Jemnější, aby byla postava poznat */}
                    <Pixelation granularity={4} />

                    {/* 2. Bloom - Aby svítily oči a reaktor */}
                    <Bloom luminanceThreshold={0.6} intensity={1.2} radius={0.6} />

                    {/* 3. Noise - Zrnění jako na staré CRT televizi */}
                    <Noise opacity={0.1} />

                    {/* 4. Scanlines - Řádkování obrazovky */}
                    <Scanline density={1.2} opacity={0.15} />

                    {/* 5. Vignette - Ztmavení rohů pro hororový efekt */}
                    <Vignette eskil={false} offset={0.1} darkness={0.6} />

                    {/* 6. Glitch - Jen když jsi na dně */}
                    <Glitch
                        active={integrity < 0.3}
                        delay={[1, 3]}
                        duration={[0.1, 0.3]}
                        strength={[0.3, 0.5]}
                        mode={GlitchMode.SPORADIC}
                    />
                </EffectComposer>

                {/* Omezení ovládání, aby to vypadalo jako v menu hry */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 2.2}
                    maxPolarAngle={Math.PI / 1.8}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
};

export default BodyWidget;
