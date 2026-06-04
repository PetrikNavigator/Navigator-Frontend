import * as THREE from "three"

const LINE_CACHE = new Map<number, THREE.LineBasicMaterial>()
const FILL_CACHE = new Map<number, THREE.MeshBasicMaterial>()

// Pack 24-bit color + 8-bit quantized opacity into a single cache key.
function makeKey(color: number, opacity: number): number {
    return (color << 8) | Math.round(opacity * 255)
}

export function lineMat(color: number, opacity = 1): THREE.LineBasicMaterial {
    const key = makeKey(color, opacity)
    let m = LINE_CACHE.get(key)
    if (!m) {
        m = new THREE.LineBasicMaterial({
            color,
            transparent: opacity < 1,
            opacity,
            depthWrite: opacity === 1
        })
        LINE_CACHE.set(key, m)
    }
    return m
}

export function fillMat(color: number, opacity = 0.55): THREE.MeshBasicMaterial {
    const key = makeKey(color, opacity)
    let m = FILL_CACHE.get(key)
    if (!m) {
        m = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            side: THREE.DoubleSide,
            depthWrite: opacity === 1
        })
        FILL_CACHE.set(key, m)
    }
    return m
}
