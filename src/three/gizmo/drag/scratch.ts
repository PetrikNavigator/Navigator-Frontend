import * as THREE from "three"

// Reusable scratch shared across drag handlers — avoids per-frame allocs.
export const SCRATCH = {
    v1: new THREE.Vector3(),
    v2: new THREE.Vector3(),
    v3: new THREE.Vector3(),
    m1: new THREE.Matrix4(),
    floorPlane: new THREE.Plane(),
    up: new THREE.Vector3(0, 1, 0),
}
