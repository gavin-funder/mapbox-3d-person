# Mapbox 3D World Map with Animated Person

An interactive 3D world map built with **Mapbox GL JS** and **Three.js**. Features a fully animated 3D person model (Soldier) that can walk, run, jump, and turn on a satellite terrain map.

![Demo](https://img.shields.io/badge/demo-interactive-blue)

## Features

- **World map** with Mapbox GL JS satellite imagery and 3D terrain
- **3D animated person** loaded via Three.js GLTFLoader (Soldier.glb model)
- **Multiple actions**: Idle, Walk, Run, Jump with smooth animation blending
- **Keyboard controls** for real-time character movement
- **Camera follow** — map pans smoothly to follow the character
- **Coordinate tracking** — live lat/lng display as character moves

## Controls

| Key | Action |
|---|---|
| `W` / `↑` | Move forward |
| `S` / `↓` | Move backward |
| `A` / `←` | Turn left |
| `D` / `→` | Turn right |
| `Shift` + move | Run |
| `Space` | Jump |

## Setup

### 1. Get a Mapbox Access Token

Sign up at [mapbox.com](https://account.mapbox.com/) and create an access token.

### 2. Add Your Token

Open `index.html` and replace the placeholder token:

```javascript
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';
```

### 3. Serve the Files

The app uses ES modules (`import`), so it must be served over HTTP (not `file://`).

**Option A — Python:**
```bash
python3 -m http.server 8080
```

**Option B — Node.js:**
```bash
npx serve .
```

**Option C — VS Code Live Server extension**

Then open `http://localhost:8080` in your browser.

## Tech Stack

- **Mapbox GL JS v3.4** — world map rendering, satellite imagery, 3D terrain
- **Three.js r163** — 3D model loading, animation, rendering via custom Mapbox layer
- **GLTFLoader** — loads the animated Soldier.glb model from three.js examples
- **Mapbox Custom Layer API** — bridges Three.js scene into Mapbox's WebGL context

## Architecture

The app uses Mapbox GL JS's [Custom Layer interface](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface) to inject a Three.js scene into the map's rendering pipeline:

1. `onAdd()` — initializes the Three.js scene, camera, lights, renderer, and loads the GLTF model
2. `render()` — on every frame, syncs the Three.js camera with Mapbox's projection matrix, updates the model's world position via Mercator coordinates, and renders the scene
3. A separate `requestAnimationFrame` game loop handles keyboard input, character state, animation transitions, and map camera following

## 3D Model

Uses the **Soldier.glb** model from the [Three.js examples repository](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf), which includes these embedded animations:
- `Idle` — standing still
- `Walk` — walking forward
- `Run` — running forward
- `TPose` — default T-pose

## License

MIT
