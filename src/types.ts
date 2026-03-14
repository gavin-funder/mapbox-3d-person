import type * as THREE from 'three';

export interface Model3DConfig {
  url?: string;
  lng: number;
  lat: number;
  heading?: number;
  altitude?: number;
  altitudeOffset?: number;
  scale?: number;
  baseRotation?: [number, number, number];
}

export type AnimationMap = Record<string, THREE.AnimationAction>;

export type AnimationName = 'Idle' | 'Walk' | 'Run' | 'TPose';

export interface AppConfig {
  accessToken: string;
  modelUrl: string;
  modelOrigin: [number, number];
  walkSpeed: number;
  runSpeed: number;
  turnSpeed: number;
  jumpForce: number;
  gravity: number;
  demoTargetLat: number;
  mapStyle: string;
  initialZoom: number;
  initialPitch: number;
  initialBearing: number;
  terrainExaggeration: number;
  modelScale: number;
}

export interface GameState {
  keys: Record<string, boolean>;
  isJumping: boolean;
  jumpVelocity: number;
  jumpHeight: number;
  demoRunning: boolean;
}

export interface UIElements {
  actionState: HTMLElement;
  coordDisplay: HTMLElement;
  loadingOverlay: HTMLElement;
}
