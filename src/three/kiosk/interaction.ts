import * as THREE from "three"
import { updateNdcFromPointer } from "../gizmo/rayMath"
import type { KioskNode, KioskPick } from "./types"

export type KioskInteractionOpts = {
    canvas: HTMLCanvasElement
    camera: THREE.Camera
    /** Current node list. Identity is used to cache the pickable map. */
    getNodes: () => KioskNode[]
    /** Fired on a genuine click (pointer that didn't move far = not an orbit). */
    onPick: (pick: KioskPick) => void
    /** Fired on hover; null when nothing is under the pointer. */
    onHover?: (pick: KioskPick | null) => void
    requestRender?: () => void
}

// Pointer travel (px) under which a press/release counts as a click rather
// than an orbit drag.
const CLICK_MOVE_TOLERANCE = 6

function pickFor(node: KioskNode): KioskPick {
    if (node.kind === "floor") {
        return { kind: "floor", buildingId: node.buildingId, storey: node.storey ?? 0 }
    }
    return { kind: "classroom", id: node.id }
}

/** Raycast-based pick/hover for the kiosk. Deliberately separate from
 *  geometry so an object can move (transform change) without any wiring
 *  here changing — it only ever reads node.pickables and node.object. */
export function attachKioskInteraction(opts: KioskInteractionOpts): () => void {
    const { canvas, camera, getNodes, onPick, onHover, requestRender } = opts
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()

    let downX = 0
    let downY = 0
    let downId = -1

    // mesh -> node, rebuilt only when the node list reference changes.
    let cachedNodes: KioskNode[] | null = null
    let meshToNode = new Map<THREE.Object3D, KioskNode>()

    const ensureMap = (): void => {
        const nodes = getNodes()
        if (nodes === cachedNodes) return
        cachedNodes = nodes
        meshToNode = new Map()
        for (const node of nodes) {
            for (const pickable of node.pickables) meshToNode.set(pickable, node)
        }
    }

    // Only pickables whose owning node is currently visible — keeps a
    // hidden floor underneath from swallowing the ray.
    const collectVisiblePickables = (): THREE.Object3D[] => {
        ensureMap()
        const out: THREE.Object3D[] = []
        for (const [mesh, node] of meshToNode) {
            if (node.object.visible) out.push(mesh)
        }
        return out
    }

    const raycastPick = (e: PointerEvent): KioskPick | null => {
        updateNdcFromPointer(e, canvas, ndc)
        raycaster.setFromCamera(ndc, camera)
        const hits = raycaster.intersectObjects(collectVisiblePickables(), false)
        if (hits.length === 0) return null
        const node = meshToNode.get(hits[0].object)
        return node ? pickFor(node) : null
    }

    const onPointerMove = (e: PointerEvent): void => {
        const pick = raycastPick(e)
        canvas.style.cursor = pick ? "pointer" : ""
        onHover?.(pick)
        requestRender?.()
    }

    const onPointerDown = (e: PointerEvent): void => {
        if (e.button !== 0) return
        downX = e.clientX
        downY = e.clientY
        downId = e.pointerId
    }

    const onPointerUp = (e: PointerEvent): void => {
        if (e.button !== 0 || e.pointerId !== downId) return
        downId = -1
        const moved = Math.hypot(e.clientX - downX, e.clientY - downY)
        if (moved > CLICK_MOVE_TOLERANCE) return // was an orbit drag, not a tap
        const pick = raycastPick(e)
        if (pick) onPick(pick)
    }

    const onPointerLeave = (): void => {
        canvas.style.cursor = ""
        onHover?.(null)
    }

    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointerleave", onPointerLeave)

    return () => {
        canvas.removeEventListener("pointermove", onPointerMove)
        canvas.removeEventListener("pointerdown", onPointerDown)
        canvas.removeEventListener("pointerup", onPointerUp)
        canvas.removeEventListener("pointerleave", onPointerLeave)
    }
}
