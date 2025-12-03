import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Pixelation, Scanline, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const Limb = ({ position, size, color, scale = [1, 1, 1] }) => {
    return (
        <mesh position={position} scale={scale}>
            <boxGeometry args={size} />
            <meshStandardMaterial
                color={color}
                roughness={0.6}
                metalness={0.4}
            />
        </mesh>
    );
};

const Avatar = ({ stats, hardcoreMode }) => {
    const group = useRef();

    // Animation state
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Idle animation: simple floating effect
        if (group.current) {
            group.current.position.y = 0.025 * Math.sin(t * 2);
        }
    });

    const primaryColor = hardcoreMode ? '#000000' : '#7A9670'; // Military Green

    // Muscle scaling based on training stat (assuming 0-1 range)
    const muscleScale = 0.85 + ((stats?.training || 0) * 0.7);

    return (
        <group ref={group}>
            {/* Head */}
            <Limb position={[0, 1.45, 0]} size={[0.35, 0.4, 0.4]} color={primaryColor} />
            {/* Torso */}
            <Limb position={[0, 0.9, 0]} size={[0.9, 0.6, 0.5]} color={primaryColor} />
            {/* Left Arm */}
            <Limb
                position={[0.6, 0.9, 0]}
                size={[0.3, 0.7, 0.3]}
                color={primaryColor}
                scale={[muscleScale, 1, muscleScale]}
            />
            {/* Right Arm */}
            <Limb
                position={[-0.6, 0.9, 0]}
                size={[0.3, 0.7, 0.3]}
                color={primaryColor}
                scale={[muscleScale, 1, muscleScale]}
            />
            {/* Left Leg */}
            <Limb position={[0.2, -0.1, 0]} size={[0.3, 1.1, 0.35]} color={primaryColor} />
            {/* Right Leg */}
            <Limb position={[-0.2, -0.1, 0]} size={[0.3, 1.1, 0.35]} color={primaryColor} />
        </group>
    );
};

const DoomAvatar = ({ stats = { training: 0 }, hardcoreMode = false }) => {
    return (
        <div style={{ width: '100%', height: '100%', background: '#101010' }}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: false }} // Pixelated look
            >
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 5, 5]} intensity={1} castShadow />

                <Avatar stats={stats} hardcoreMode={hardcoreMode} />

                <EffectComposer>
                    <Pixelation granularity={4} />
                    <Scanline density={1.5} opacity={0.1} />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};

export default DoomAvatar;
