import mapboxgl from 'mapbox-gl';
import type { ThreeModelLayer } from './three-model-layer';
import type { AppConfig, UIElements } from './types';

export function createMap(config: AppConfig): mapboxgl.Map {
  mapboxgl.accessToken = config.accessToken;

  const map = new mapboxgl.Map({
    container: 'map',
    style: config.mapStyle,
    zoom: config.initialZoom,
    center: config.modelOrigin,
    pitch: config.initialPitch,
    bearing: config.initialBearing,
    antialias: true,
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  return map;
}

export function setupMapLayers(
  map: mapboxgl.Map,
  modelLayer: ThreeModelLayer,
  config: AppConfig,
  ui: UIElements,
): void {
  // Enable 3D Terrain
  map.on('style.load', () => {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: config.terrainExaggeration });
  });

  // Map load
  map.on('load', () => {
    // Red highlight circle under the model
    map.addSource('model-highlight', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: config.modelOrigin },
      },
    });

    map.addLayer({
      id: 'model-highlight-pulse',
      type: 'circle',
      source: 'model-highlight',
      paint: {
        'circle-radius': 18,
        'circle-color': 'rgba(255, 50, 50, 0.25)',
        'circle-stroke-color': 'rgba(255, 50, 50, 0.8)',
        'circle-stroke-width': 2,
      },
    });

    // Add the 3D model layer
    map.addLayer(modelLayer);

    // Load player model
    modelLayer.addModel('player', {
      url: config.modelUrl,
      lng: config.modelOrigin[0],
      lat: config.modelOrigin[1],
      heading: 0,
      altitude: 0,
      altitudeOffset: 0,
      scale: config.modelScale,
      baseRotation: [Math.PI / 2, 0, 0],
    }).then(() => {
      ui.loadingOverlay.classList.add('hidden');
      console.log('Player model loaded');
    }).catch((err: unknown) => {
      console.error('Failed to load player model:', err);
      ui.loadingOverlay.innerHTML =
        '<div style="color:#ff6b6b">Failed to load 3D model</div>';
    });
  });
}
