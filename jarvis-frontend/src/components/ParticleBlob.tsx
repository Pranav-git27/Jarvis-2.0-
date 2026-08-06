import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'searching' | 'completed';

const PARTICLE_COUNT = 3000;
const SPHERE_RADIUS = 2;

const STATE_CONFIG: Record<OrbState, {
  rotationSpeed: number;
  pulseSpeed: number;
  pulseAmount: number;
  waveSpeed: number;
  waveAmount: number;
  colorPrimary: number;
  colorSecondary: number;
  bloomIntensity: number;
  particleSize: number;
}> = {
  idle: {
    rotationSpeed: 0.08,
    pulseSpeed: 0.8,
    pulseAmount: 0.02,
    waveSpeed: 0.3,
    waveAmount: 0.008,
    colorPrimary: 0xD4712B,
    colorSecondary: 0xF59E0B,
    bloomIntensity: 1.2,
    particleSize: 0.022,
  },
  listening: {
    rotationSpeed: 0.12,
    pulseSpeed: 1.8,
    pulseAmount: 0.04,
    waveSpeed: 1.2,
    waveAmount: 0.025,
    colorPrimary: 0x10B981,
    colorSecondary: 0x06B6D4,
    bloomIntensity: 1.4,
    particleSize: 0.024,
  },
  thinking: {
    rotationSpeed: 0.25,
    pulseSpeed: 1.5,
    pulseAmount: 0.05,
    waveSpeed: 0.8,
    waveAmount: 0.015,
    colorPrimary: 0xD4712B,
    colorSecondary: 0xF59E0B,
    bloomIntensity: 1.6,
    particleSize: 0.024,
  },
  speaking: {
    rotationSpeed: 0.15,
    pulseSpeed: 2.0,
    pulseAmount: 0.06,
    waveSpeed: 1.6,
    waveAmount: 0.02,
    colorPrimary: 0x3B82F6,
    colorSecondary: 0x06B6D4,
    bloomIntensity: 1.5,
    particleSize: 0.023,
  },
  searching: {
    rotationSpeed: 0.2,
    pulseSpeed: 1.2,
    pulseAmount: 0.04,
    waveSpeed: 0.6,
    waveAmount: 0.03,
    colorPrimary: 0x00F0FF,
    colorSecondary: 0x3B82F6,
    bloomIntensity: 1.4,
    particleSize: 0.024,
  },
  completed: {
    rotationSpeed: 0.05,
    pulseSpeed: 0.6,
    pulseAmount: 0.015,
    waveSpeed: 0.2,
    waveAmount: 0.005,
    colorPrimary: 0x10B981,
    colorSecondary: 0x22C55E,
    bloomIntensity: 1.8,
    particleSize: 0.026,
  },
};

function fibonacciSphere(samples: number, radius: number): Float32Array {
  const points = new Float32Array(samples * 3);
  const phi = Math.PI * (Math.sqrt(5) - 1);

  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    points[i * 3] = Math.cos(theta) * radiusAtY * radius;
    points[i * 3 + 1] = y * radius;
    points[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
  }

  return points;
}

interface ParticlesProps {
  state: OrbState;
}

function Particles({ state }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rippleRef = useRef(0);
  const scanAngleRef = useRef(0);
  const config = STATE_CONFIG[state];

  const targetColorsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const currentColorsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));

  const [positions, basePositions] = useMemo(() => {
    const pos = fibonacciSphere(PARTICLE_COUNT, SPHERE_RADIUS);
    const base = new Float32Array(pos);
    return [pos, base];
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const primary = new THREE.Color(config.colorPrimary);
    const secondary = new THREE.Color(config.colorSecondary);
    const temp = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      temp.copy(primary).lerp(secondary, t);
      cols[i * 3] = temp.r;
      cols[i * 3 + 1] = temp.g;
      cols[i * 3 + 2] = temp.b;
      targetColorsRef.current[i * 3] = temp.r;
      targetColorsRef.current[i * 3 + 1] = temp.g;
      targetColorsRef.current[i * 3 + 2] = temp.b;
      currentColorsRef.current[i * 3] = temp.r;
      currentColorsRef.current[i * 3 + 1] = temp.g;
      currentColorsRef.current[i * 3 + 2] = temp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return geo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  useEffect(() => {
    const primary = new THREE.Color(config.colorPrimary);
    const secondary = new THREE.Color(config.colorSecondary);
    const temp = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      temp.copy(primary).lerp(secondary, t);
      targetColorsRef.current[i * 3] = temp.r;
      targetColorsRef.current[i * 3 + 1] = temp.g;
      targetColorsRef.current[i * 3 + 2] = temp.b;
    }

    // Trigger ripple on state change
    rippleRef.current = 1;
  }, [state, config.colorPrimary, config.colorSecondary]);

  useFrame((stateClock) => {
    if (!pointsRef.current) return;
    const t = stateClock.clock.getElapsedTime();

    // Gentle rotation with state-specific speed
    pointsRef.current.rotation.y = t * config.rotationSpeed;
    pointsRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;

    // Breathing pulse - more organic feel
    const breathe = Math.sin(t * config.pulseSpeed) * config.pulseAmount;
    const breathe2 = Math.sin(t * config.pulseSpeed * 0.7 + 1.3) * config.pulseAmount * 0.5;
    const pulse = 1 + breathe + breathe2;
    pointsRef.current.scale.setScalar(pulse);

    // Ripple effect on state change
    if (rippleRef.current > 0.01) {
      rippleRef.current *= 0.96;
    }

    // Scanning effect - a vertical plane of brightness
    scanAngleRef.current = (scanAngleRef.current + 0.008) % (Math.PI * 2);

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const colorArray = colorAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const bx = basePositions[ix];
      const by = basePositions[iy];
      const bz = basePositions[iz];

      // Wave displacement
      const wave = Math.sin(t * config.waveSpeed + bx * 0.5) * config.waveAmount;
      const wave2 = Math.cos(t * config.waveSpeed * 0.8 + bz * 0.5) * config.waveAmount;

      // Ripple displacement
      const rippleDisp = rippleRef.current * Math.sin(by * 4 + t * 3) * 0.04;

      posArray[ix] = bx + wave + rippleDisp;
      posArray[iy] = by + wave2;
      posArray[iz] = bz + wave * 0.5;

      // Color transition lerp
      colorArray[ix] += (targetColorsRef.current[ix] - colorArray[ix]) * 0.04;
      colorArray[iy] += (targetColorsRef.current[iy] - colorArray[iy]) * 0.04;
      colorArray[iz] += (targetColorsRef.current[iz] - colorArray[iz]) * 0.04;

      // Scanning highlight effect
      const scanY = Math.sin(scanAngleRef.current) * SPHERE_RADIUS;
      const scanDist = Math.abs(by - scanY);
      if (scanDist < 0.3) {
        const scanBrightness = (1 - scanDist / 0.3) * 0.15;
        colorArray[ix] = Math.min(colorArray[ix] + scanBrightness, 1);
        colorArray[iy] = Math.min(colorArray[iy] + scanBrightness, 1);
        colorArray[iz] = Math.min(colorArray[iz] + scanBrightness, 1);
      }
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Smooth pointer interaction
    pointsRef.current.rotation.x += (mouseRef.current.y * 0.2 - pointsRef.current.rotation.x) * 0.02;
    pointsRef.current.rotation.y += (mouseRef.current.x * 0.3 - pointsRef.current.rotation.y) * 0.02;
  });

  const handlePointerMove = (e: { point: THREE.Vector3 }) => {
    mouseRef.current.x = e.point.x * 0.3;
    mouseRef.current.y = e.point.y * 0.3;
  };

  return (
    <points ref={pointsRef} onPointerMove={handlePointerMove} geometry={geometry}>
      <pointsMaterial
        size={config.particleSize}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

interface ParticleBlobProps {
  state: OrbState;
}

export default function ParticleBlob({ state }: ParticleBlobProps) {
  const config = STATE_CONFIG[state];

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ background: '#030508' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#030508']} />

        <Particles state={state} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />

        <EffectComposer>
          <Bloom
            intensity={config.bloomIntensity}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* Orb state glow overlay */}
      <div
        className="orb-glow-overlay"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${
            state === 'listening' ? '16, 185, 129' :
            state === 'thinking' ? '212, 113, 43' :
            state === 'speaking' ? '59, 130, 246' :
            state === 'searching' ? '0, 240, 255' :
            state === 'completed' ? '34, 197, 94' :
            '212, 113, 43'
          }, 0.08) 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'all 0.8s ease',
        }}
      />
    </div>
  );
}
