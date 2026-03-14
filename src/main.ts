import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';

import { CONFIG } from './config';
import type { GameState, UIElements } from './types';
import { ThreeModelLayer } from './three-model-layer';
import { setupKeyboardInput } from './input';
import { createMap, setupMapLayers } from './map-setup';
import { startGameLoop } from './game-loop';

// Game state
const state: GameState = {
  keys: {},
  isJumping: false,
  jumpVelocity: 0,
  jumpHeight: 0,
  demoRunning: true,
};

// UI elements
const ui: UIElements = {
  actionState: document.getElementById('action-state')!,
  coordDisplay: document.getElementById('coord-display')!,
  loadingOverlay: document.getElementById('loading-overlay')!,
};

// Create map and model layer
const map = createMap(CONFIG);
const modelLayer = new ThreeModelLayer('3d-model');

// Setup terrain, layers, and load model
setupMapLayers(map, modelLayer, CONFIG, ui);

// Setup keyboard input
setupKeyboardInput(state);

// Start game loop
startGameLoop(modelLayer, map, state, CONFIG, ui);
