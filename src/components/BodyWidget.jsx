import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Ring } from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, Noise } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import * as THREE from 'three';
import './BodyWidget.css';

// --- GEOMETRY PARTS (The Body) ---

const CyberPwrt = ({ position, args, type = "box", color, speed = 1, integrity = 1, isPumped = false, stage = "ROOKIE", category = "neutral", statValue = 0 }) => {
    const mesh = useRef();
    const [randomOffset] = useState(() => Math.random() * 100);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Base movement
        let yPos = position[1] + Math.sin(t * speed + randomOffset) * 0.02;
        let rotZ = Math.sin(t * 0.5 + randomOffset) * 0.02;

        // WITHER EFFECT: Glitchy movement if integrity is low
        if (integrity < 0.4) {
            if (Math.random() > 0.95) {
                yPos += (Math.random() - 0.5) * 0.1;
                rotZ += (Math.random() - 0.5) * 0.2;
            }
        }

        // SCALING LOGIC based on Category & Stats
        let targetScale = 1;

        if (category === 'training') {
            // Training affects muscle mass (Torso, Arms)
            targetScale = 1 + (statValue * 0.3); // Up to 1.3x size
            if (isPumped) targetScale += 0.2; // Extra pump
        } else if (category === 'knowledge') {
            // Knowledge affects head pulse
            if (statValue > 0) {
                targetScale = 1 + Math.sin(t * 3) * (statValue * 0.1);
            }
        }

        mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.1));
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, yPos, 0.1);
        mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, rotZ, 0.1);
    });

    // Visual Style based on Stage
    const isRookie = stage === "ROOKIE";
    const isGodlike = stage === "GODLIKE";
    const isWithered = integrity < 0.4;

    return (
        <mesh ref={mesh} position={position}>
            {type === "box" && <boxGeometry args={args} />}
            {type === "sphere" && <icosahedronGeometry args={args} />}
            {type === "capsule" && <capsuleGeometry args={args} />}

            {/* MATERIAL EVOLUTION */}
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isGodlike ? 2 : (isPumped ? 1 : 0.2)}
                transparent
                opacity={isRookie ? 0.1 : (isWithered ? 0.1 : 0.9)}
                roughness={isRookie ? 0.5 : 0.1}
                metalness={isRookie ? 0.1 : 1}
                wireframe={isRookie || (isWithered && Math.random() > 0.5)}
            />

            {/* Wireframe Overlay (Always visible for tech look, stronger in Rookie) */}
            <lineSegments>
                <edgesGeometry args={[type === "box" ? new THREE.BoxGeometry(...args) : (type === "sphere" ? new THREE.IcosahedronGeometry(...args) : new THREE.CapsuleGeometry(...args))]} />
                <lineBasicMaterial color={color} opacity={isRookie ? 0.8 : 0.3} transparent />
            </lineSegments>
        </mesh>
    );
};

const Halo = ({ color }) => {
    const ref = useRef();
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        ref.current.rotation.z = t * 0.2;
        ref.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    });
    return (
        <group ref={ref}>
            <Ring args={[1.2, 1.25, 64]} position={[0, 0.8, 0]}>
                <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.5} />
            </Ring>
            <Ring args={[1.4, 1.42, 64]} position={[0, 0.8, 0]} rotation={[0.5, 0, 0]}>
                <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.3} />
            </Ring>
        </group>
    );
};

const CyborgModel = ({ stats, integrity, isGodMode, isPumped, stage }) => {
    // Dynamická barva podle dominantního statu
    const baseColor = useMemo(() => {
        if (isGodMode) return '#FFD700'; // GOLD for God Mode
        if (stats.training > stats.recovery && stats.training > stats.knowledge) return '#39FF14'; // Neon Green (Power)
        if (stats.recovery > stats.training && stats.recovery > stats.knowledge) return '#39D1FF'; // Cyber Blue (Recovery)
        if (stats.knowledge > stats.training && stats.knowledge > stats.recovery) return '#FFD139'; // Gold (Knowledge)
        return '#ffffff'; // Neutral
    }, [stats, isGodMode]);

    const finalColor = integrity < 0.4 ? '#ff003c' : baseColor;
    const isGodlikeStage = stage === "GODLIKE";

    return (
        <group position={[0, -0.8, 0]}>
            {/* HEAD - Knowledge */}
            <CyberPwrt
                position={[0, 1.6, 0]} args={[0.25, 1]} type="sphere" color={finalColor}
                speed={isGodMode ? 5 : 2} integrity={integrity} isPumped={isPumped}
                stage={stage} category="knowledge" statValue={stats.knowledge}
            />

            {/* TORSO - Training */}
            <CyberPwrt
                position={[0, 0.8, 0]} args={[0.4, 0.6, 0.3]} type="box" color={finalColor}
                speed={isGodMode ? 4 : 1.5} integrity={integrity} isPumped={isPumped}
                stage={stage} category="training" statValue={stats.training}
            />

            {/* ARMS - Training */}
            <CyberPwrt
                position={[-0.5, 0.8, 0]} args={[0.1, 0.6, 4, 8]} type="capsule" color={finalColor}
                speed={isGodMode ? 3 : 1.2} integrity={integrity} isPumped={isPumped}
                stage={stage} category="training" statValue={stats.training}
            />
            <CyberPwrt
                position={[0.5, 0.8, 0]} args={[0.1, 0.6, 4, 8]} type="capsule" color={finalColor}
                speed={isGodMode ? 3 : 1.2} integrity={integrity} isPumped={isPumped}
                stage={stage} category="training" statValue={stats.training}
            />

            {/* LEGS - Recovery/Base */}
            <CyberPwrt
                position={[-0.2, 0, 0]} args={[0.12, 0.8, 4, 8]} type="capsule" color={finalColor}
                speed={isGodMode ? 2 : 0.8} integrity={integrity} isPumped={isPumped}
                stage={stage} category="recovery" statValue={stats.recovery}
            />
            <CyberPwrt
                position={[0.2, 0, 0]} args={[0.12, 0.8, 4, 8]} type="capsule" color={finalColor}
                speed={isGodMode ? 2 : 0.8} integrity={integrity} isPumped={isPumped}
                stage={stage} category="recovery" statValue={stats.recovery}
            />

            {/* GODLIKE HALO */}
            {isGodlikeStage && <Halo color={finalColor} />}
        </group>
    );
};

const BodyWidget = ({ stats, isPumped = false, streak = 0 }) => {
    // Výpočet "zdraví" hologramu
    const integrity = stats ? (stats.training + stats.nutrition + stats.recovery + stats.knowledge) / 4 : 0;
    const isGodMode = integrity >= 0.9;

    // Determine Stage
    let stage = "ROOKIE";
    if (streak >= 50) stage = "GODLIKE";
    else if (streak >= 10) stage = "OPERATIVE";

    // Zprávy systému (Tamagotchi element)
    const [message, setMessage] = useState("SYSTEM ONLINE");
    const [surge, setSurge] = useState(false);
    const prevIntegrity = useRef(integrity);

    // Aggressive Message Logic
    useEffect(() => {
        if (integrity > prevIntegrity.current) {
            setSurge(true);
            setTimeout(() => setSurge(false), 1000);
        }
        prevIntegrity.current = integrity;

        const hour = new Date().getHours();

        if (integrity < 0.3) {
            setMessage("FAILURE IMMINENT. DO SOMETHING.");
        } else if (integrity < 0.6) {
            if (hour >= 20) setMessage("YOU ARE RUNNING OUT OF TIME.");
            else setMessage("MEDIOCRE PERFORMANCE.");
        } else if (integrity < 0.9) {
            setMessage("STAY HARD. NOT DONE YET.");
        } else {
            setMessage("WHO IS GONNA CARRY THE BOATS?");
        }
    }, [integrity]);

    // Barva světla pro scénu
    let glowColor = '#39FF14';
    if (integrity < 0.4) glowColor = '#ff003c';
    if (isGodMode) glowColor = '#FFD700'; // Golden Glow

    return (
        <div className="body-widget-container" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* UI Overlay */}
            <div className="cyber-overlay">
                <div className="status-line">
                    <span className="blink-dot" style={{ background: glowColor, boxShadow: isGodMode ? `0 0 10px ${glowColor}` : 'none' }}></span>
                    {message}
                </div>
                <div className="energy-bar-wrapper">
                    <div className="energy-label">SYNC RATE [{stage}]</div>
                    <div className="energy-bar">
                        <div className="energy-fill" style={{ width: `${integrity * 100}%`, background: glowColor, boxShadow: isGodMode ? `0 0 20px ${glowColor}` : 'none' }}></div>
                    </div>
                </div>
            </div>

            {/* 3D Scene */}
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true }}
            >
                {/* Osvětlení */}
                <ambientLight intensity={isGodMode ? 1.5 : 0.5} />
                <pointLight position={[10, 10, 10]} intensity={isGodMode ? 5 : (surge || isPumped ? 4 : 1)} color={glowColor} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

                {/* The Character - Floating Animation */}
                <Float
                    speed={isGodMode ? 3 : (surge ? 5 : 2)}
                    rotationIntensity={isGodMode ? 1.5 : (surge ? 0.5 : 0.2)}
                    floatIntensity={isGodMode ? 1.5 : 0.5}
                    floatingRange={isGodMode ? [-0.2, 0.2] : [-0.1, 0.1]}
                >
                    <CyborgModel
                        stats={stats || { training: 0, nutrition: 0, recovery: 0, knowledge: 0 }}
                        integrity={integrity}
                        isGodMode={isGodMode}
                        isPumped={isPumped}
                        stage={stage}
                    />
                </Float>

                {/* Particles around */}
                <Sparkles
                    key={stage} // Force re-render on stage switch
                    count={stage === "GODLIKE" ? 200 : (stage === "OPERATIVE" ? 100 : 30)}
                    scale={3.5}
                    size={stage === "GODLIKE" ? 5 : 2}
                    speed={0.4}
                    opacity={0.5}
                    color={glowColor}
                />

                {/* Post Processing Effects */}
                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={0.1}
                        mipmapBlur
                        intensity={isGodMode ? 2.5 : (surge || isPumped ? 4 : 1.5)}
                        radius={isGodMode ? 0.8 : 0.6}
                    />
                    <Noise opacity={0.1} />
                    <Glitch
                        delay={[1.5, 3.5]}
                        duration={[0.1, 0.3]}
                        strength={[0.2, 0.4]}
                        mode={GlitchMode.CONSTANT_MILD}
                        active={integrity < 0.4}
                        ratio={0.85}
                    />
                </EffectComposer>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate
                    autoRotateSpeed={isGodMode ? 2.0 : (surge ? 5 : 1.0)}
                />
            </Canvas>
        </div>
    );
};

export default BodyWidget;
