import { Boids } from "./Boids";
import { Studio } from "./Studio";
import * as Dat from "dat.gui";
import * as THREE from "three";
import { Vector3 } from "three";

const drawPoint = (
  position: Vector3,
  material: THREE.Material,
  scene: THREE.Scene
): THREE.Mesh => {
  const point = new THREE.Mesh(new THREE.SphereBufferGeometry(0.03), material);
  point.position.copy(position);
  scene.add(point);
  return point;
};

const main = (args?: ["string"]) => {
  console.time("Setup");

  const clock = new THREE.Clock();

  const studio = new Studio(".webgl");
  studio.addOrbitControls();

  // add axix helper
  const axesHelper = new THREE.AxesHelper(5);
  studio.scene.add(axesHelper);

  const gui = new Dat.GUI();
  axesHelper.visible = false;
  gui.add(axesHelper, "visible");

  const boids = new Boids(studio.scene);
  boids.addElements(1000);

  gui.add(boids, "separationCoef", -10, 10, 0.0001).name("Separation Coef");
  gui.add(boids, "alignmentCoef", -10, 10, 0.0001).name("Alignment Coef");
  gui.add(boids, "cohesionCoef", -10, 10, 0.0001).name("Cohesion Coef");
  gui.add(boids, "radiusOfVision", -10, 10, 0.0001).name("Radius Of Vision");
  gui
    .add(boids, "handleBoundMethod", ["teleport", "bounce"])
    .name("If out of bound");

  console.timeEnd("Setup");

  const Render = () => {
    const elapsedTime = clock.getElapsedTime();

    boids.Render(elapsedTime);

    // let theta be the amount you want to rotate by
    // var x = studio.camera.position.x;
    // var z = studio.camera.position.z;

    // studio.camera.position.x =
    //   x * Math.cos(boids._deltaTime / 20) + z * Math.sin(boids._deltaTime / 20);
    // studio.camera.position.z =
    //   z * Math.cos(boids._deltaTime / 20) - x * Math.sin(boids._deltaTime / 20);
    // studio.camera.lookAt(boids._boundingBox.position);

    studio.Render(elapsedTime);

    window.requestAnimationFrame(Render);
  };
  Render();
};

main();
