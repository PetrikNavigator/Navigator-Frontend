import type * as THREE from "three"
import { DIM_OPACITY } from "../../types/three/material-types"
import type { AppData } from "./materials"
import { KIOSK_COLORS } from "./palette"
import type { IsolatedFloor, KioskAppearance, KioskNode } from "./types"

/** How a single node should read against the current state. */
type Emphasis = "start" | "end" | "highlight" | "dim" | "base"

function paint(
    mesh: THREE.Object3D,
    color: THREE.ColorRepresentation,
    opacity: number,
): void {
    const mat = (mesh as THREE.Mesh).material as
        | THREE.MeshBasicMaterial
        | THREE.LineBasicMaterial
        | undefined
    if (!mat) return
    mat.color.set(color)
    mat.opacity = opacity
    mat.transparent = opacity < 1
}

/** A node is visible when nothing is isolated, or when it belongs to the
 *  isolated building+storey. Vertical assets show if they pass through. */
function visibleUnder(node: KioskNode, iso: IsolatedFloor): boolean {
    if (!iso) return true
    if (node.buildingId !== iso.buildingId) return false
    if (node.kind === "lift" || node.kind === "stairs") {
        return iso.storey >= (node.storeyMin ?? 0) && iso.storey <= (node.storeyMax ?? 0)
    }
    return node.storey === iso.storey
}

function classroomEmphasis(node: KioskNode, state: KioskAppearance): Emphasis {
    const { selection, highlight } = state
    if (selection?.start && selection.start === node.id) return "start"
    if (selection?.end && selection.end === node.id) return "end"

    if (highlight) {
        const byId = highlight.classroomIds?.includes(node.id) ?? false
        const byType =
            !!node.typeId &&
            (highlight.typeIds?.includes(node.typeId) ?? false)
        if (byId || byType) return "highlight"
        const filtering =
            (highlight.typeIds?.length ?? 0) > 0 ||
            (highlight.classroomIds?.length ?? 0) > 0
        if (filtering && highlight.dimOthers) return "dim"
    }
    return "base"
}

function accentColor(e: Emphasis): number {
    switch (e) {
        case "start": return KIOSK_COLORS.start
        case "end": return KIOSK_COLORS.end
        default: return KIOSK_COLORS.highlight
    }
}

/** Repaint one mesh according to the node's emphasis, deriving from the
 *  mesh's stored base look so "base"/"dim" always restore cleanly. */
function applyMesh(mesh: THREE.Object3D, emphasis: Emphasis): void {
    const app = mesh.userData.app as AppData | undefined
    if (!app) return

    if (emphasis === "base") {
        paint(mesh, app.baseColor, app.baseOpacity)
        return
    }
    if (emphasis === "dim") {
        paint(mesh, app.baseColor, app.baseOpacity * DIM_OPACITY)
        return
    }

    // Accent: door outline stays white for contrast; everything else
    // takes the accent color at a boosted, role-appropriate opacity.
    if (app.role === "doorLine") {
        paint(mesh, app.baseColor, 1)
        return
    }
    const accent = accentColor(emphasis)
    const opacity =
        app.role === "fill" ? Math.max(app.baseOpacity, 0.85)
        : app.role === "line" ? 1
        : Math.max(app.baseOpacity, 0.9)
    paint(mesh, accent, opacity)
}

/** Apply visibility + appearance for the whole scene in place. No
 *  geometry is created or destroyed — this is the cheap per-state pass. */
export function applyAppearance(nodes: KioskNode[], state: KioskAppearance): void {
    for (const node of nodes) {
        node.object.visible = visibleUnder(node, state.isolatedFloor)
        const emphasis: Emphasis =
            node.kind === "classroom" ? classroomEmphasis(node, state) : "base"
        for (const mesh of node.appearance) applyMesh(mesh, emphasis)
    }
}
