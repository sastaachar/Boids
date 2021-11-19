import * as THREE from "three";

const defaultRange = { min: -1, max: 1 };

export const getRandRange = (range: _Range = defaultRange) => {
  return Math.random() * (range.max - range.min) + range.min;
};

export const getRandomVector3 = (
  xRange: _Range = defaultRange,
  yRange: _Range = defaultRange,
  zRange: _Range = defaultRange
): THREE.Vector3 => {
  return new THREE.Vector3(
    getRandRange(xRange),
    getRandRange(yRange),
    getRandRange(zRange)
  );
};

export const getUnitVector = (vector: THREE.Vector3): THREE.Vector3 => {
  const a = Math.sqrt(
    vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
  );

  return new THREE.Vector3(vector.x / a, vector.y / a, vector.z / a);
};

export default {
  getRandRange,
  getRandomVector3,
};

type _Range = {
  min: number;
  max: number;
};
