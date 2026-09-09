import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export type CoreState = { audioLevel: number; cameraActive: boolean; gesture: string };
function Reactor({ state }: { state: CoreState }) {
  const group = useRef<THREE.Group>(null!);
  const rings = useMemo(() => [1.45, 1.85, 2.32, 2.8], []);
  const points = useMemo(() => {
    const values = new Float32Array(900);
    for (let i = 0; i < values.length; i++) values[i] = (Math.random() - .5) * 8;
    return values;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime(); const gesturePulse = state.gesture === 'PINCH' ? .22 : state.gesture === 'OPEN PALM' ? .12 : 0;
    const scale = 1 + Math.sin(t * 1.7) * .035 + state.audioLevel * .38 + gesturePulse;
    group.current.scale.setScalar(scale * (state.cameraActive ? 1.2 : 1));
    group.current.rotation.y += .002 * (state.cameraActive ? 2.5 : 1);
  });
  return <group ref={group}><mesh><icosahedronGeometry args={[1.05, 4]} /><meshStandardMaterial color="#03769f" emissive="#00d8ff" emissiveIntensity={2 + state.audioLevel * 5} transparent opacity={.86} /></mesh>{rings.map((radius, i) => <mesh key={radius} rotation={[i * .7, i * .9, i * .4]}><torusGeometry args={[radius, .025, 8, 90]} /><meshBasicMaterial color={i % 2 ? '#1372ff' : '#5bf3ff'} transparent opacity={.85} /></mesh>)}<points rotation={[.2, 0, 0]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry><pointsMaterial color="#61efff" size={.035} transparent opacity={.85} /></points></group>;
}
export default function AICore({ state }: { state: CoreState }) { return <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 2]}><color attach="background" args={['#000000']} /><ambientLight intensity={1} /><pointLight color="#35eaff" intensity={15} distance={20} /><Reactor state={state} /><Stars radius={7} depth={10} count={160} factor={2} saturation={0} fade speed={state.cameraActive ? 2 : .5} /><EffectComposer><Bloom intensity={1.25 + state.audioLevel * 1.4} luminanceThreshold={.2} /></EffectComposer></Canvas>; }
