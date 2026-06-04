import * as THREE from "three"
import { fillMat, lineMat } from "./materials"

export function wireBox(
    w: number,
    h: number,
    d: number,
    color: number,
    opacity = 1,
): THREE.LineSegments {
    const geom = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d))
    return new THREE.LineSegments(geom, lineMat(color, opacity))
}

export function fillBox(
    w: number,
    h: number,
    d: number,
    color: number,
    opacity = 0.55,
): THREE.Mesh {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fillMat(color, opacity))
}

// Build a LINES mesh from a flat list of (a, b, a, b, …) vertex pairs.
export function makeLines(
    segments: THREE.Vector3[],
    color: number,
    opacity = 1,
): THREE.LineSegments {
    const geom = new THREE.BufferGeometry().setFromPoints(segments)
    return new THREE.LineSegments(geom, lineMat(color, opacity))
}
