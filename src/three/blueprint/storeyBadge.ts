import * as THREE from "three"

// Canvas-textured sprite for "storey N" labels. Cached by (storey,color)
// so we don't repaint per rebuild during edits.
const BADGE_CACHE = new Map<string, THREE.Sprite>()

export function makeStoreyBadge(storey: number, color: number): THREE.Sprite {
    const key = `${storey}:${color}`
    const cached = BADGE_CACHE.get(key)
    if (cached) return cached.clone()

    const size = 128
    const cv = document.createElement("canvas")
    cv.width = size
    cv.height = size
    const ctx = cv.getContext("2d")!

    const hex = "#" + color.toString(16).padStart(6, "0")
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, hex + "cc")
    grad.addColorStop(0.6, hex + "33")
    grad.addColorStop(1, hex + "00")
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = "bold 78px ui-sans-serif, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)"
    ctx.fillText(storey === 0 ? "F" : String(storey), size / 2 + 2, size / 2 + 4)
    ctx.fillStyle = "#ffffff"
    ctx.fillText(storey === 0 ? "F" : String(storey), size / 2, size / 2 + 2)

    const tex = new THREE.CanvasTexture(cv)
    tex.anisotropy = 4
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(mat)
    sprite.renderOrder = 5
    BADGE_CACHE.set(key, sprite)
    return sprite.clone()
}
