import * as THREE from "three";

import "../style.css";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Studio {
  scene: THREE.Scene;
  canvas: HTMLElement;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;

  _FPS = 0;
  _viewportSize: Size;
  _clock: THREE.Clock;

  //! to be removed

  _isControlAdded = false;
  _orbitControls: OrbitControls;

  constructor(targetCanvasClass: string) {
    console.log("Studio created");
    // create scene
    this.scene = new THREE.Scene();
    this._viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // attach to html
    this.canvas = document.querySelector(targetCanvasClass);
    //set renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this._viewportSize.width, this._viewportSize.height);

    // adding a camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this._viewportSize.width / this._viewportSize.height
    );
    this.camera.position.set(15, 10, 10);

    // adding some lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 10);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 10);
    pointLight.position.set(2, 3, 5);
    this.scene.add(ambientLight);

    this.scene.add(this.camera);

    this._clock = new THREE.Clock();

    // handle resize
    window.addEventListener("resize", this._handleWindowResize);
  }

  _handleWindowResize = () => {
    this._viewportSize.width = window.innerWidth;
    this._viewportSize.height = window.innerHeight;

    this.renderer.setSize(this._viewportSize.width, this._viewportSize.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = this._viewportSize.width / this._viewportSize.height;
    this.camera.updateProjectionMatrix();
  };

  //! to be removed
  addOrbitControls = () => {
    this._isControlAdded = true;
    this._orbitControls = new OrbitControls(this.camera, this.canvas);
    this._orbitControls.enableDamping = true;
  };

  Render = (elapsedTime: number) => {
    if (this._isControlAdded) this._orbitControls.update();
    //  camera.lookAt(mesh.position);

    this.renderer.render(this.scene, this.camera);

    this._FPS += 1;
    console.log(this._FPS / elapsedTime);
  };
}

// types

type Size = {
  height: number;
  width: number;
};
