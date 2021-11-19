import * as THREE from "three";
import { Color, Vector3 } from "three";

import math, { getRandomVector3, getUnitVector } from "../Utils/math";

const defaultRage = { min: -5, max: 5 };

class Boid {
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  mesh: THREE.Mesh;
  zone: number;
  material: THREE.MeshBasicMaterial;
  radiusOfVison: number;

  separation: boolean = true;
  alignment: boolean = true;
  cohesion: boolean = true;

  // coef
  separationCoef: number = 0.5;
  alignmentCoef: number = 1;
  cohesionCoef: number = 0.01;

  constructor(geometry: THREE.BufferGeometry, radiusOfVision = 1) {
    this.velocity = getRandomVector3().multiplyScalar(0.001);
    this.direction = this.velocity.normalize();
    this.radiusOfVison = radiusOfVision;

    const initialPosition = getRandomVector3(
      defaultRage,
      defaultRage,
      defaultRage
    );

    this.material = new THREE.MeshBasicMaterial();
    this.mesh = new THREE.Mesh(geometry, this.material);

    this._udpateDirection();
    this._updateMaterialColor();
    this.mesh.position.copy(initialPosition);
  }

  _updateMaterialColor = () => {
    const r = Math.floor(127.5 * (1 + this.direction.x)),
      g = Math.floor(127.5 * (1 + this.direction.y)),
      b = Math.floor(127.5 * (1 + this.direction.z));
    this.material.color = new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  };

  // direction is normalized
  _udpateDirection = () => {
    this.direction = this.velocity.normalize();
    // update orientation
    this.mesh.quaternion.setFromUnitVectors(this.mesh.up, this.direction);
    this._updateMaterialColor();
  };

  handleBoidInteraction = (boids: Array<Boid>, curIndex: number): void => {
    const newVelocity = this.velocity.clone();
    const centerOfNeignbours = this.mesh.position.clone();
    let totalNeighbours = 0;

    const sqRadiusOfVison = this.radiusOfVison * this.radiusOfVison;

    for (let i = 0; i < boids.length; i++) {
      if (i == curIndex) continue;

      const difX = boids[i].mesh.position.x - this.mesh.position.x;
      const difY = boids[i].mesh.position.y - this.mesh.position.y;
      const difZ = boids[i].mesh.position.z - this.mesh.position.z;

      const sqDist = difX * difX + difY * difY + difZ * difZ;

      if (sqDist <= sqRadiusOfVison) {
        if (this.separation) {
          // push away
          //a = (aPos  - bPos)*(separationCoef)
          const separationForce = this.mesh.position
            .clone()
            .sub(boids[i].mesh.position)
            .multiplyScalar(this.separationCoef / sqDist);

          newVelocity.add(separationForce);
        }

        if (this.alignment) {
          // go towards neighbour
          // a = a + bVelocity*(alignmentCoef)
          const alignmentForce = boids[i].velocity
            .clone()
            .multiplyScalar(this.alignmentCoef / sqDist);

          newVelocity.add(alignmentForce);
        }

        if (this.cohesion) {
          centerOfNeignbours.add(boids[i].mesh.position);
        }
        ++totalNeighbours;
      }
    }

    if (totalNeighbours > 0) {
      if (this.cohesion) {
        // go towards the centerofmass (take avg)
        centerOfNeignbours
          .multiplyScalar(1 / (totalNeighbours + 1))
          .sub(this.mesh.position)
          .multiplyScalar(this.cohesionCoef);

        newVelocity.add(centerOfNeignbours);
      }

      this.velocity.copy(newVelocity);

      this._udpateDirection();
    }
  };

  handleBoidMovement = (_deltaTime: number) => {
    // distance = speed * time
    const deltaDistance = this.velocity.clone().multiplyScalar(_deltaTime);

    if (
      Math.abs(this.mesh.position.x + deltaDistance.x) >= 10 ||
      Math.abs(this.mesh.position.y + deltaDistance.y) >= 10 ||
      Math.abs(this.mesh.position.z + deltaDistance.z) >= 10
    ) {
      this.mesh.position.multiplyScalar(-1);
      return;
    }

    this.mesh.position.add(deltaDistance);
  };

  Render = (_deltaTime: number, boids: Array<Boid>, curIndex: number) => {
    this.handleBoidInteraction(boids, curIndex);
    this.handleBoidMovement(_deltaTime);
  };
}

export class Boids {
  scene: THREE.Scene;

  elements: Array<Boid>;
  _commonMaterial: THREE.Material;
  _commonGeometry: THREE.ConeBufferGeometry;
  _clock: THREE.Clock;
  _boundingBox: THREE.Mesh;
  _deltaTime: number;
  _elapsedTime: number;
  _boudingBoxMaterial: THREE.MeshStandardMaterial;

  separationCoef: number = 0.07;
  alignmentCoef: number = 0.5;
  cohesionCoef: number = 0.1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.elements = new Array<Boid>();
    this._commonMaterial = new THREE.MeshBasicMaterial();

    this._commonGeometry = new THREE.ConeBufferGeometry(0.09, 0.3);
    this._clock = new THREE.Clock();

    this._boudingBoxMaterial = new THREE.MeshStandardMaterial({
      color: 0x3090f2,
    });

    const textureLoader = new THREE.TextureLoader();
    const waterColorMap = textureLoader.load(
      "Textures/Water/Water_002_COLOR.jpg"
    );

    const dustAplhaMap = textureLoader.load("Textures/dust-texture.jpg");

    this._boudingBoxMaterial.map = waterColorMap;
    this._boudingBoxMaterial.alphaMap = dustAplhaMap;
    this._boudingBoxMaterial.side = THREE.DoubleSide;

    this._boudingBoxMaterial.transparent = true;
    this._boudingBoxMaterial.opacity = 0.3;

    this._boundingBox = new THREE.Mesh(
      new THREE.BoxBufferGeometry(20, 20, 20),
      this._boudingBoxMaterial
    );

    this._elapsedTime = 0;
    this.scene.add(this._boundingBox);
  }

  addElements = (count: number) => {
    for (let i = 0; i < count; i++) {
      const boid = new Boid(this._commonGeometry);

      this.scene.add(boid.mesh);
      this.elements.push(boid);
    }
  };

  Render = (elapsedTime: number) => {
    this._deltaTime = elapsedTime - this._elapsedTime;
    this._elapsedTime = elapsedTime;

    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].separationCoef = this.separationCoef;
      this.elements[i].alignmentCoef = this.alignmentCoef;
      this.elements[i].cohesionCoef = this.cohesionCoef;

      this.elements[i].Render(this._deltaTime, this.elements, i);
    }
  };
}
