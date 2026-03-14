import * as THREE from 'three';
import type mapboxgl from 'mapbox-gl';
import type { ThreeModelLayer } from './three-model-layer';
import type { AppConfig, GameState, UIElements } from './types';

export function startGameLoop(
  modelLayer: ThreeModelLayer,
  map: mapboxgl.Map,
  state: GameState,
  config: AppConfig,
  ui: UIElements,
): void {
  function gameLoop(): void {
    requestAnimationFrame(gameLoop);

    const player = modelLayer.getModel('player');
    if (!player || !player.loaded) return;

    const isForward = state.keys['w'] || state.keys['arrowup'];
    const isBackward = state.keys['s'] || state.keys['arrowdown'];
    const isTurnLeft = state.keys['a'] || state.keys['arrowleft'];
    const isTurnRight = state.keys['d'] || state.keys['arrowright'];
    const isRunning = state.keys['shift'];
    const manualMoving = isForward || isBackward;

    // Stop demo on any key press
    if (manualMoving || isTurnLeft || isTurnRight) state.demoRunning = false;

    // Auto-walk demo
    if (state.demoRunning) {
      if (player.lat < config.demoTargetLat) {
        player.lat += config.runSpeed;
        player.switchAnimation('Run');
      } else {
        state.demoRunning = false;
        player.switchAnimation('Idle');
      }
    } else {
      // Manual controls
      if (isTurnLeft) player.heading -= config.turnSpeed;
      if (isTurnRight) player.heading += config.turnSpeed;

      if (manualMoving) {
        const speed = isRunning ? config.runSpeed : config.walkSpeed;
        const direction = isBackward ? -1 : 1;
        const headingRad = THREE.MathUtils.degToRad(player.heading);
        player.lat += Math.cos(headingRad) * speed * direction;
        player.lng += Math.sin(headingRad) * speed * direction;
      }

      // Jumping
      if (state.keys['space'] && !state.isJumping) {
        state.isJumping = true;
        state.jumpVelocity = config.jumpForce;
      }
      if (state.isJumping) {
        state.jumpHeight += state.jumpVelocity;
        state.jumpVelocity -= config.gravity;
        if (state.jumpHeight <= 0) {
          state.jumpHeight = 0;
          state.isJumping = false;
          state.jumpVelocity = 0;
        }
      }
      player.altitudeOffset = state.jumpHeight;

      // Choose animation
      if (manualMoving && isRunning) {
        player.switchAnimation('Run');
      } else if (manualMoving) {
        player.switchAnimation('Walk');
      } else if (!state.isJumping) {
        player.switchAnimation('Idle');
      }
    }

    // Update UI
    ui.actionState.textContent = player.activeActionName;
    ui.coordDisplay.textContent = `${player.lat.toFixed(5)}, ${player.lng.toFixed(5)}`;

    // Update red highlight circle position
    const highlightSrc = map.getSource('model-highlight') as mapboxgl.GeoJSONSource | undefined;
    if (highlightSrc) {
      highlightSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [player.lng, player.lat] },
      });
    }

    // Camera follows character with zoom and bearing
    map.jumpTo({
      center: [player.lng, player.lat],
      zoom: config.initialZoom,
      bearing: -player.heading,
    });
  }

  gameLoop();
}
