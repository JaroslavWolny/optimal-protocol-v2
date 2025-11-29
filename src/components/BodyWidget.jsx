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
const RetroLimb = ({ position, args, color, scale = [1, 1, 1], glow = false, edgeColor = "black" }) => {
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
                roughness={0.6} // Matný povrch jako starý plast/kov
                metalness={0.4}
                emissive={color}
                emissiveIntensity={glow ? 1 : 0.1} // Slight emissive everywhere for visibility
                flatShading={true} // KLÍČOVÉ: Zobrazí polygony (nevyhlazuje hrany)
            />
            {/* Obrysy pro komiksový/cel-shaded look */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(...args)]} />
                <lineBasicMaterial color={edgeColor} opacity={0.5} transparent />
            </lineSegments>
        </Box>
    );
};

// --- THE DOOM SLAYER (Procedural Avatar) ---
const DoomAvatar = ({ stats, integrity, stage, hardcoreMode }) => {
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

    // --- MODE VISUALS CONFIG ---
    const isGodMode = stage === "GODLIKE";

    let primaryColor, skinColor, coreColor, edgeColor, eyeColor;

    if (hardcoreMode) {
        if (isGodMode) {
            // DEATH GOD: THE VOID WALKER (Epic, Out of Box)
            primaryColor = '#050505'; // Vantablack Armor
            skinColor = '#2a0a2a';    // Dark Matter Skin
            coreColor = '#ffffff';    // Blinding White Singularity
            edgeColor = '#b026ff';    // Neon Purple Event Horizon
            eyeColor = '#ff0000';     // Sith Lord Eyes
        } else {
            // DEATH NORMAL: CYBER-NECROMANCER
            primaryColor = '#1a1a2e'; // Dark Navy/Purple Armor
            skinColor = '#300000';    // Dark Red/Dried Blood Skin
            coreColor = '#ff0000';    // Pure Red Core
            edgeColor = '#ff003c';    // Neon Red Edges
            eyeColor = '#ffffff';     // White Dead Eyes
        }
    } else {
        if (isGodMode) {
            // SAFE GOD: GOLDEN SAINT
            primaryColor = '#ffd700'; // Gold
            skinColor = '#fffacd';    // Lemon Chiffon (Glowing skin)
            coreColor = '#00ffff';    // Cyan Core
            edgeColor = '#b8860b';    // Dark Goldenrod Edges
            eyeColor = '#00ffff';     // Cyan Eyes
        } else {
            // SAFE NORMAL: DOOM MARINE
            primaryColor = '#7c9670'; // Military Green
            skinColor = '#e0a686';    // Human Skin
            coreColor = rec > 0.8 ? '#33ff33' : (rec > 0.4 ? '#33cccc' : '#ff3333');
            edgeColor = '#000000';    // Black Edges
            eyeColor = '#ff3360';     // Red Visor/Eyes
        }
    }

    // --- RETRO ANIMATION LOOP ---
    useFrame((state) => {
        if (!group.current) return;

        // Simulace nízkého FPS pro pohyb (Stop-motion efekt)
        const time = state.clock.elapsedTime;
        const snappedTime = Math.floor(time * FPS_LIMIT) / FPS_LIMIT;

        // "Idle Bobbing" - POSUNUTO DOLŮ kvůli textu (změněno na -0.5)
        group.current.position.y = -0.5 + Math.sin(snappedTime * 2) * 0.05;

        // Jemné natočení do stran (Idle stance)
        group.current.rotation.y = Math.sin(snappedTime * 1) * 0.05;
    });

    // Dynamic Leg Spacing
    const legSpacing = 0.22 * muscleScale;

    return (
        <group ref={group}>
            {/* --- GOD MODE AURA (EPIC PARTICLES) --- */}
            {isGodMode && (
                <Sparkles
                    count={100}
                    scale={4}
                    size={4}
                    speed={0.4}
                    opacity={0.8}
                    color={hardcoreMode ? "#b026ff" : "#ffd700"}
                    position={[0, 0, 0]}
                />
            )}

            {/* --- HLAVA (Helmet) --- */}
            <group position={[0, 1.45, 0]} scale={headIntel}>
                <RetroLimb args={[0.35, 0.4, 0.4]} color={primaryColor} edgeColor={edgeColor} /> {/* Helma */}
                <RetroLimb args={[0.25, 0.12, 0.05]} color="#111" position={[0, 0, 0.18]} edgeColor={edgeColor} /> {/* Hledí */}
                {/* Oči */}
                {(know > 0.5 || hardcoreMode || isGodMode) && (
                    <>
                        <RetroLimb args={[0.04, 0.04, 0.05]} color={eyeColor} position={[0.08, 0, 0.19]} glow={true} />
                        <RetroLimb args={[0.04, 0.04, 0.05]} color={eyeColor} position={[-0.08, 0, 0.19]} glow={true} />
                    </>
                )}
            </group>

            {/* --- TRUP (Armor) --- */}
            <RetroLimb args={[0.9 + (str * 0.5), 0.6, 0.5]} color={primaryColor} position={[0, 0.9, 0]} edgeColor={edgeColor} /> {/* Hrudní plát */}
            <RetroLimb args={[0.5 * coreBulk, 0.6, 0.35 * coreBulk]} color={hardcoreMode ? '#000' : "#1a1a1a"} position={[0, 0.35, 0]} edgeColor={edgeColor} /> {/* Břicho */}

            {/* REAKTOR / SRDCE */}
            <RetroLimb args={[0.15, 0.15, 0.1]} color={coreColor} position={[0, 0.9, 0.26]} glow={true} />

            {/* --- PAŽE --- */}
            {/* Levá */}
            <group position={[0.55 + (str * 0.25), 0.9, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 0.35, 0.3 * muscleScale]} color={primaryColor} position={[0, 0, 0]} edgeColor={edgeColor} /> {/* Rameno */}
                <RetroLimb args={[0.22 * muscleScale, 0.7, 0.22 * muscleScale]} color={skinColor} position={[0, -0.5, 0]} edgeColor={edgeColor} /> {/* Biceps */}
                <RetroLimb args={[0.25 * muscleScale, 0.3, 0.25 * muscleScale]} color="#333" position={[0, -0.9, 0]} edgeColor={edgeColor} /> {/* Rukavice */}
            </group>
            {/* Pravá */}
            <group position={[-(0.55 + (str * 0.25)), 0.9, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 0.35, 0.3 * muscleScale]} color={primaryColor} position={[0, 0, 0]} edgeColor={edgeColor} />
                <RetroLimb args={[0.22 * muscleScale, 0.7, 0.22 * muscleScale]} color={skinColor} position={[0, -0.5, 0]} edgeColor={edgeColor} />
                <RetroLimb args={[0.25 * muscleScale, 0.3, 0.25 * muscleScale]} color="#333" position={[0, -0.9, 0]} edgeColor={edgeColor} />
            </group>

            {/* --- NOHY --- */}
            <group position={[legSpacing, -0.1, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 1.1, 0.35 * muscleScale]} color={primaryColor} position={[0, -0.5, 0]} edgeColor={edgeColor} />
            </group>
            <group position={[-legSpacing, -0.1, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 1.1, 0.35 * muscleScale]} color={primaryColor} position={[0, -0.5, 0]} edgeColor={edgeColor} />
            </group>
        </group>
    );
};

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
