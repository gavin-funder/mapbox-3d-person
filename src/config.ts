import type { AppConfig } from './types';

const MODEL_ORIGIN: [number, number] = [2.2945, 48.8586];

export const CONFIG: AppConfig = {
  accessToken: import.meta.env.VITE_MAPBOX_TOKEN as string,
  modelUrl: 'https://threejs.org/examples/models/gltf/Soldier.glb',
  modelOrigin: MODEL_ORIGIN,
  walkSpeed: 0.00003,
  runSpeed: 0.00009,
  turnSpeed: 2.0,
  jumpForce: 0.15,
  gravity: 0.006,
  demoTargetLat: MODEL_ORIGIN[1] + 0.01449,
  mapStyle: 'mapbox://styles/mapbox/standard-satellite',
  initialZoom: 22,
  initialPitch: 60,
  initialBearing: 0,
  terrainExaggeration: 1.5,
  modelScale: 1.2,
};
