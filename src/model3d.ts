import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { Model3DConfig, AnimationMap, AnimationName } from './types';
import { CONFIG } from './config';

export class Model3D {
  url: string;
  lng: number;
  lat: number;
  heading: number;
  altitude: number;
  altitudeOffset: number;
  scale: number;
  baseRotation: [number, number, number];
  scene: THREE.Group | null = null;
  mixer: THREE.AnimationMixer | null = null;
  animations: AnimationMap = {};
  activeAction: THREE.AnimationAction | null = null;
  activeActionName: string = 'Idle';
  loaded: boolean = false;

  constructor(config: Model3DConfig) {
    this.url = config.url ?? CONFIG.modelUrl;
    this.lng = config.lng;
    this.lat = config.lat;
    this.heading = config.heading ?? 0;
    this.altitude = config.altitude ?? 0;
    this.altitudeOffset = config.altitudeOffset ?? 0;
    this.scale = config.scale ?? 1.2;
    this.baseRotation = config.baseRotation ?? [Math.PI / 2, 0, 0];
  }

  load(loader: GLTFLoader): Promise<this> {
    return new Promise((resolve, reject) => {
      loader.load(
        this.url,
        (gltf) => {
          this.scene = gltf.scene;
          this.scene.matrixAutoUpdate = false;

          this.mixer = new THREE.AnimationMixer(this.scene);
          gltf.animations.forEach((clip) => {
            this.animations[clip.name] = this.mixer!.clipAction(clip);
            console.log('Loaded animation:', clip.name);
          });

          if (this.animations['Idle']) {
            this.activeAction = this.animations['Idle'];
            this.activeAction.play();
            this.activeActionName = 'Idle';
          }

          this.loaded = true;
          resolve(this);
        },
        undefined,
        reject,
      );
    });
  }

  switchAnimation(name: AnimationName | string): void {
    if (name === this.activeActionName) return;
    if (!this.animations[name]) return;

    const prev = this.activeAction;
    this.activeAction = this.animations[name];
    this.activeActionName = name;

    if (prev) prev.fadeOut(0.2);
    this.activeAction.reset().fadeIn(0.2).play();
  }

  update(delta: number): void {
    if (this.mixer) this.mixer.update(delta);
  }

  setPosition(lng: number, lat: number): void {
    this.lng = lng;
    this.lat = lat;
  }
}
