import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mapboxgl from 'mapbox-gl';
import { Model3D } from './model3d';
import type { Model3DConfig } from './types';

export class ThreeModelLayer implements mapboxgl.CustomLayerInterface {
  id: string;
  type: 'custom' = 'custom';
  renderingMode: '3d' = '3d';
  slot: string = 'middle';

  private models: Map<string, Model3D> = new Map();
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private renderer!: THREE.WebGLRenderer;
  private map!: mapboxgl.Map;
  private loader: GLTFLoader = new GLTFLoader();
  private clock: THREE.Clock = new THREE.Clock();

  constructor(id: string) {
    this.id = id;
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
    this.map = map;
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir1.position.set(0, 70, 100).normalize();
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xffd68a, 0.6);
    dir2.position.set(-50, 30, -50).normalize();
    this.scene.add(dir2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    });
    this.renderer.autoClear = false;
  }

  render(_gl: WebGLRenderingContext, vpMatrix: number[]): void {
    const delta = this.clock.getDelta();

    for (const [_id, model] of this.models) {
      if (!model.loaded) continue;
      model.update(delta);

      // Query terrain elevation
      let elevation = 0;
      if (this.map.getTerrain()) {
        elevation = this.map.queryTerrainElevation(
          { lng: model.lng, lat: model.lat } as mapboxgl.LngLatLike,
        ) ?? 0;
      }

      // Compute Mercator position (terrain + altitude + offset)
      const mercPos = mapboxgl.MercatorCoordinate.fromLngLat(
        [model.lng, model.lat],
        elevation + model.altitude + model.altitudeOffset,
      );
      const s = mercPos.meterInMercatorCoordinateUnits() * model.scale;

      // Build model transform: translation -> scale -> base rotation -> heading
      const rotX = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0), model.baseRotation[0],
      );
      const rotY = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0), model.baseRotation[1],
      );
      const rotZ = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1), model.baseRotation[2],
      );
      const headingRot = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        THREE.MathUtils.degToRad(model.heading),
      );

      const modelTransform = new THREE.Matrix4()
        .makeTranslation(mercPos.x, mercPos.y, mercPos.z)
        .scale(new THREE.Vector3(s, -s, s))
        .multiply(rotX)
        .multiply(rotY)
        .multiply(rotZ)
        .multiply(headingRot);

      // Keep model at origin — bake transform into camera below
      model.scene!.matrix.identity();
      model.scene!.matrixWorldNeedsUpdate = true;

      // Official Mapbox pattern: bake VP * ModelTransform into camera projection
      const vp = new THREE.Matrix4().fromArray(vpMatrix);
      this.camera.projectionMatrix.copy(vp.multiply(modelTransform));

      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
    }

    this.map.triggerRepaint();
  }

  async addModel(id: string, config: Model3DConfig): Promise<Model3D> {
    const model = new Model3D(config);
    await model.load(this.loader);
    this.scene.add(model.scene!);
    this.models.set(id, model);
    return model;
  }

  removeModel(id: string): void {
    const model = this.models.get(id);
    if (model?.scene) {
      this.scene.remove(model.scene);
    }
    this.models.delete(id);
  }

  getModel(id: string): Model3D | undefined {
    return this.models.get(id);
  }
}
