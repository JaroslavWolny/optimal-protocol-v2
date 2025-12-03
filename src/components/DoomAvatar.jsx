import React, { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Sparkles, Box } from '@react-three/drei';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

// --- CUSTOM SHADER MATERIAL (GLSL) ---
// This mimics the "Retro/Hologram" look with Scanlines & Glitch
// replacing the standard material for that "Metal Shader" feel.

const RetroHologramMaterial = shaderMaterial(
    {
        time: 0,
        baseColor: new THREE.Color(0.0, 1.0, 0.0),
        scanlineDensity: 50.0,
        glitchStrength: 0.0,
        noiseStrength: 0.1,
        opacity: 1.0,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    uniform float time;
    uniform float glitchStrength;

    // Simple random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;

      // Vertex Glitch (Jitter)
      if (glitchStrength > 0.0) {
          float jitter = random(vec2(time, pos.y)) * 2.0 - 1.0;
          if (random(vec2(time * 0.5, pos.y)) > 0.9) {
             pos.x += jitter * glitchStrength * 0.1;
          }
      }

      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    // Fragment Shader
    `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    uniform float time;
    uniform vec3 baseColor;
    uniform float scanlineDensity;
    uniform float glitchStrength;
    uniform float noiseStrength;
    uniform float opacity;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // 1. Base Color
      vec3 color = baseColor;

      // 2. Lighting (Simple directional)
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(vNormal, lightDir), 0.2); // 0.2 ambient
      color *= diff;

      // 3. Scanlines
      float scanline = sin(vUv.y * scanlineDensity * 10.0 - time * 5.0);
      // Make scanlines dark bands
      if (scanline < 0.0) {
          color *= 0.8; 
      }

      // 4. Glitch (Color Shift / Chromatic Aberration)
      if (glitchStrength > 0.0) {
          float shift = random(vec2(time, vUv.y)) * glitchStrength * 0.05;
          if (random(vec2(time * 2.0, vUv.y)) > 0.95) {
              color.r += shift;
              color.b -= shift;
          }
      }

      // 5. Noise
      float noise = random(vUv * time) * noiseStrength;
      color += noise;

      // 6. Hologram Edge Glow (Fresnel-ish)
      vec3 viewDir = normalize(cameraPosition - vPosition); // Note: vPosition is local in VS, need world? 
      // Actually standard shaderMaterial doesn't pass cameraPosition easily in local space without world pos.
      // Let's stick to simple flat shading + scanlines for the "Retro" look.

      gl_FragColor = vec4(color, opacity);
    }
  `
);

extend({ RetroHologramMaterial });

// --- RETRO LIMB COMPONENT ---
const RetroLimb = ({ position, args, color, scale = [1, 1, 1], glow = false, edgeColor = "black", glitchIntensity = 0 }) => {
    const mesh = useRef();
    const material = useRef();

    useFrame((state) => {
        if (material.current) {
            material.current.time = state.clock.elapsedTime;
            material.current.glitchStrength = glitchIntensity;

            // Pulse effect for glow
            if (glow) {
                material.current.baseColor = new THREE.Color(color).multiplyScalar(1.0 + Math.sin(state.clock.elapsedTime * 5.0) * 0.5);
            }
        }
    });

    return (
        <Box args={args} position={position} scale={scale} ref={mesh}>
            {/* Use our Custom Shader Material */}
            <retroHologramMaterial
                ref={material}
                baseColor={new THREE.Color(color)}
                scanlineDensity={20.0}
                glitchStrength={glitchIntensity}
                noiseStrength={0.05}
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
            // DEATH GOD: THE VOID WALKER
            primaryColor = '#050505';
            skinColor = '#2a0a2a';
            coreColor = '#ffffff';
            edgeColor = '#b026ff';
            eyeColor = '#ff0000';
        } else {
            // DEATH NORMAL: CYBER-NECROMANCER
            primaryColor = '#1a1a2e';
            skinColor = '#300000';
            coreColor = '#ff0000';
            edgeColor = '#ff003c';
            eyeColor = '#ffffff';
        }
    } else {
        if (isGodMode) {
            // SAFE GOD: GOLDEN SAINT
            primaryColor = '#ffd700';
            skinColor = '#fffacd';
            coreColor = '#00ffff';
            edgeColor = '#b8860b';
            eyeColor = '#00ffff';
        } else {
            // SAFE NORMAL: DOOM MARINE
            primaryColor = '#7c9670';
            skinColor = '#e0a686';
            coreColor = rec > 0.8 ? '#33ff33' : (rec > 0.4 ? '#33cccc' : '#ff3333');
            edgeColor = '#000000';
            eyeColor = '#ff3360';
        }
    }

    // Determine Glitch Intensity based on Health (Integrity)
    // Lower integrity = More Glitch
    const glitchIntensity = integrity < 0.3 ? (0.3 - integrity) * 5.0 : 0.0;

    // --- RETRO ANIMATION LOOP ---
    useFrame((state) => {
        if (!group.current) return;

        // Simulace nízkého FPS pro pohyb (Stop-motion efekt)
        const FPS_LIMIT = 12;
        const time = state.clock.elapsedTime;
        const snappedTime = Math.floor(time * FPS_LIMIT) / FPS_LIMIT;

        // "Idle Bobbing"
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
                <RetroLimb args={[0.35, 0.4, 0.4]} color={primaryColor} edgeColor={edgeColor} glitchIntensity={glitchIntensity} /> {/* Helma */}
                <RetroLimb args={[0.25, 0.12, 0.05]} color="#111" position={[0, 0, 0.18]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} /> {/* Hledí */}
                {/* Oči */}
                {(know > 0.5 || hardcoreMode || isGodMode) && (
                    <>
                        <RetroLimb args={[0.04, 0.04, 0.05]} color={eyeColor} position={[0.08, 0, 0.19]} glow={true} glitchIntensity={glitchIntensity} />
                        <RetroLimb args={[0.04, 0.04, 0.05]} color={eyeColor} position={[-0.08, 0, 0.19]} glow={true} glitchIntensity={glitchIntensity} />
                    </>
                )}
            </group>

            {/* --- TRUP (Armor) --- */}
            <RetroLimb args={[0.9 + (str * 0.5), 0.6, 0.5]} color={primaryColor} position={[0, 0.9, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} /> {/* Hrudní plát */}
            <RetroLimb args={[0.5 * coreBulk, 0.6, 0.35 * coreBulk]} color={hardcoreMode ? '#000' : "#1a1a1a"} position={[0, 0.35, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} /> {/* Břicho */}

            {/* REAKTOR / SRDCE */}
            <RetroLimb args={[0.15, 0.15, 0.1]} color={coreColor} position={[0, 0.9, 0.26]} glow={true} glitchIntensity={glitchIntensity} />

            {/* --- PAŽE --- */}
            {/* Levá */}
            <group position={[0.55 + (str * 0.25), 0.9, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 0.35, 0.3 * muscleScale]} color={primaryColor} position={[0, 0, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} /> {/* Rameno */}
                <RetroLimb args={[0.22 * muscleScale, 0.7, 0.22 * muscleScale]} color={skinColor} position={[0, -0.5, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} /> {/* Biceps */}
                <RetroLimb args={[0.25 * muscleScale, 0.3, 0.25 * muscleScale]} color="#333" position={[0, -0.9, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} /> {/* Rukavice */}
            </group>
            {/* Pravá */}
            <group position={[-(0.55 + (str * 0.25)), 0.9, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 0.35, 0.3 * muscleScale]} color={primaryColor} position={[0, 0, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} />
                <RetroLimb args={[0.22 * muscleScale, 0.7, 0.22 * muscleScale]} color={skinColor} position={[0, -0.5, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} />
                <RetroLimb args={[0.25 * muscleScale, 0.3, 0.25 * muscleScale]} color="#333" position={[0, -0.9, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} />
            </group>

            {/* --- NOHY --- */}
            <group position={[legSpacing, -0.1, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 1.1, 0.35 * muscleScale]} color={primaryColor} position={[0, -0.5, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} />
            </group>
            <group position={[-legSpacing, -0.1, 0]}>
                <RetroLimb args={[0.3 * muscleScale, 1.1, 0.35 * muscleScale]} color={primaryColor} position={[0, -0.5, 0]} edgeColor={edgeColor} glitchIntensity={glitchIntensity} />
            </group>
        </group>
    );
};

export default DoomAvatar;
