import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Box, Plane } from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, Noise, Pixelation, Scanline, Vignette } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import * as THREE from 'three';
import './BodyWidget.css';

// --- RETRO ENGINE CONFIG ---
const FPS_LIMIT = 12; // Animace postavy poběží jen na 12 FPS (Doom style)

// --- RETRO LIMB COMPONENT ---
const RetroLimb = ({ position, args, color, scale = [1, 1, 1], glow = false }) => {
    const mesh = useRef();

    // Low-FPS animace materiálu (blikání pro glow)
    useFrame((state) => {
        if (glow && mesh.current) {
            // Používáme Math.floor pro skokové změny hodnot (retro feel)
            const time = Math.floor(state.clock.elapsedTime * 8) / 8;
            mesh.current.material.emissiveIntensity = 0.8 + Math.sin(time * 5) * 0.4;
        }
    });

    return (
        <Box args={args} position={position} scale={scale} ref={mesh}>
            <meshStandardMaterial
                color={color}
                roughness={0.8} // Matný povrch jako starý plast/kov
                metalness={0.2}
                emissive={color}
                emissiveIntensity={glow ? 1 : 0}
                flatShading={true} // KLÍČOVÉ: Zobrazí polygony (nevyhlazuje hrany)
            />
            {/* Černé obrysy pro komiksový/cel-shaded look (volitelné, vypadá dobře na PS1) */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(...args)]} />
                <lineBasicMaterial color="black" opacity={0.3} transparent />
            </lineSegments>
        </Box>
    );
};

// --- THE DOOM SLAYER (Procedural Avatar) ---
const DoomAvatar = ({ stats, integrity, stage }) => {
    const group = useRef();

    // Stats Mapping
    const str = stats.training || 0.1;
    const nut = stats.nutrition || 0.1;
    const know = stats.knowledge || 0.1;
    const rec = stats.recovery || 0.1;

    // Body Morphing
    const muscleScale = 0.85 + (str * 0.7); // Ramena a ruce
    const coreBulk = 0.7 + (nut * 0.6);     // Trup
    const headIntel = 0.9 + (know * 0.3);   // Hlava

    // Colors (Doom Palette)
    const armorGreen = '#5b6e53'; // Doom Marine Green
    const fleshColor = '#c48666'; // Pixelated Skin
    const demonRed = '#ff003c';   // Hell Energy
    const godGold = '#ffd700';    // God Mode

    const primaryColor = stage === "GODLIKE" ? godGold : (integrity < 0.3 ? '#2a2a2a' : armorGreen);
    const coreColor = rec > 0.8 ? '#00ff00' : (rec > 0.4 ? '#00aaaa' : '#ff0000'); // Health pack colors

    // --- RETRO ANIMATION LOOP ---
    useFrame((state) => {
        if (!group.current) return;

        // Simulace nízkého FPS pro pohyb (Stop-motion efekt)
        const time = state.clock.elapsedTime;
        const snappedTime = Math.floor(time * FPS_LIMIT) / FPS_LIMIT;

        // "Idle Bobbing" - typické pro Doom sprity, postava dýchá nahoru/dolů
        group.current.position.y = -1.2 + Math.sin(snappedTime * 2) * 0.05;

        // Jemné natočení do stran (Idle stance)
        group.current.rotation.y = Math.sin(snappedTime * 1) * 0.05;
    });

    return (
        <group ref={group}>
            {/* --- HLAVA (Helmet) --- */}
            <group position={[0, 1.45, 0]} scale={headIntel}>
                <RetroLimb args={[0.35, 0.4, 0.4]} color={primaryColor} /> {/* Helma */}
                <RetroLimb args={[0.25, 0.12, 0.05]} color="#000" position={[0, 0, 0.18]} /> {/* Hledí */}
                {/* Oči svítí podle Knowledge */}
                {know > 0.5 && (
                    <>
                        <RetroLimb args={[0.04, 0.04, 0.05]} color={demonRed} position={[0.08, 0, 0.19]} glow={true} />
                        <RetroLimb args={[0.04, 0.04, 0.05]} color={demonRed} position={[-0.08, 0, 0.19]} glow={true} />
                    </>
                )}
            </group>

            {/* --- TRUP (Armor) --- */}
            <RetroLimb args={[0.9 + (str * 0.5), 0.6, 0.5]} color={primaryColor} position={[0, 0.9, 0]} /> {/* Hrudní plát */}
            <RetroLimb args={[0.5 * coreBulk, 0.6, 0.35 * coreBulk]} color="#1a1a1a" position={[0, 0.35, 0]} /> {/* Břicho (kevlar) */}

            {/* REAKTOR / SRDCE (Recovery Indicator) */}
            <RetroLimb args={[0.15, 0.15, 0.1]} color={coreColor} position={[0, 0.9, 0.26]} glow={true} />

            {/* --- PAŽE (Guns) --- */}
            {/* Levá */}
            <group position={[0.55 + (str * 0.25), 0.9, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 0.35, 0.3 * muscleScale]} color={primaryColor} position={[0, 0, 0]} /> {/* Rameno */}
                <RetroLimb args={[0.22 * muscleScale, 0.7, 0.22 * muscleScale]} color={fleshColor} position={[0, -0.5, 0]} /> {/* Biceps (odhalený) */}
                <RetroLimb args={[0.25 * muscleScale, 0.3, 0.25 * muscleScale]} color="#333" position={[0, -0.9, 0]} /> {/* Rukavice */}
            </group>
            {/* Pravá */}
            <group position={[-(0.55 + (str * 0.25)), 0.9, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 0.35, 0.3 * muscleScale]} color={primaryColor} position={[0, 0, 0]} />
                <RetroLimb args={[0.22 * muscleScale, 0.7, 0.22 * muscleScale]} color={fleshColor} position={[0, -0.5, 0]} />
                <RetroLimb args={[0.25 * muscleScale, 0.3, 0.25 * muscleScale]} color="#333" position={[0, -0.9, 0]} />
            </group>

            {/* --- NOHY (Legs) --- */}
            <group position={[0.22, -0.1, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 1.1, 0.35 * muscleScale]} color={primaryColor} position={[0, -0.5, 0]} />
            </group>
            <group position={[-0.22, -0.1, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 1.1, 0.35 * muscleScale]} color={primaryColor} position={[0, -0.5, 0]} />
            </group>

            {/* --- ZBRAŇ (Symbol disciplíny) --- */}
            {/* Objeví se jen pokud máš Training > 50% */}
            {str > 0.5 && (
                <group position={[0.8 + (str * 0.2), 0, 0.4]} rotation={[-0.5, 0, 0]}>
                    <RetroLimb args={[0.15, 0.8, 0.15]} color="#111" /> {/* Hlaveň */}
                    <RetroLimb args={[0.16, 0.16, 0.16]} color={demonRed} position={[0, 0.35, 0]} glow={true} /> {/* Ústí */}
                </group>
            )}
        </group>
    );
};

// --- SCENE SETUP ---
const BodyWidget = ({ stats, isPumped = false, streak = 0 }) => {
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
                camera={{ position: [0, 0, 4.5], fov: 50 }}
                gl={{ antialias: false, preserveDrawingBuffer: true }}
                dpr={0.5} // Poloviční rozlišení pro pixelizaci už na úrovni rendereru
            >
                <color attach="background" args={['#050505']} />

                {/* Lighting - High Contrast Doom Style */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
                <pointLight position={[0, 0, 3]} intensity={0.5} color={glowColor} distance={5} />

                {/* Environment - Simple Grid */}
                <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -2.5, 0]} />

                <DoomAvatar stats={safeStats} integrity={integrity} stage={stage} />

                {/* POST PROCESSING - THE RETRO MAGIC */}
                <EffectComposer disableNormalPass>
                    {/* 1. Pixelation - Udělá z toho kostičky (rozlišení 320x240 feel) */}
                    <Pixelation granularity={6} />

                    {/* 2. Bloom - Aby svítily oči a reaktor */}
                    <Bloom luminanceThreshold={0.5} intensity={1.5} radius={0.8} />

                    {/* 3. Noise - Zrnění jako na staré CRT televizi */}
                    <Noise opacity={0.15} />

                    {/* 4. Scanlines - Řádkování obrazovky */}
                    <Scanline density={1.5} opacity={0.3} />

                    {/* 5. Vignette - Ztmavení rohů pro hororový efekt */}
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />

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
