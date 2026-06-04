import * as THREE from "three"
import { makeLines } from "../../blueprint/primitives"
import type { StoreyResolver } from "../../../types/three/storey-types"

// Per-storey square outline + diagonal "X" reading as "stops here".
// Used by lifts (and as a hint marker for stairs at each landing).
export function buildDeckMarkers(args: {
    buildingId: string
    storeys: StoreyResolver
    cx: number
    cz: number
    minStorey: number
    maxStorey: number
    footprint: number
    color: number
    opacity: number
}): THREE.LineSegments {
    const { buildingId, storeys, cx, cz, minStorey, maxStorey, footprint, color, opacity } = args
    const half = footprint * 0.5
    const segs: THREE.Vector3[] = []

    for (let s = minStorey; s <= maxStorey; s++) {
        const ys = storeys.bottomY(buildingId, s)
        const corners = [
            new THREE.Vector3(cx - half, ys, cz - half),
            new THREE.Vector3(cx + half, ys, cz - half),
            new THREE.Vector3(cx + half, ys, cz + half),
            new THREE.Vector3(cx - half, ys, cz + half),
        ]
        for (let i = 0; i < 4; i++) segs.push(corners[i], corners[(i + 1) % 4])
        segs.push(corners[0], corners[2], corners[1], corners[3])
    }
    return makeLines(segs, color, Math.min(1, opacity * 0.85))
}
