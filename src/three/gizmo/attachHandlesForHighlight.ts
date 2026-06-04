import * as THREE from "three"
import type { Highlight } from "../../types/three/build-scene-types"
import { attachBuildingHandles } from "./handles/attachBuildingHandles"
import { attachClassroomHandles } from "./handles/attachClassroomHandles"
import { attachCorridorHandles } from "./handles/attachCorridorHandles"
import {
    attachLiftHandles,
    attachStairsHandles,
} from "./handles/attachVerticalAssetHandles"

// Walk a scene root and locate the anchor object whose highlightKind
// matches the current Highlight. Returns null when nothing is highlighted.
export function findHighlightTarget(
    root: THREE.Object3D,
    highlight: Highlight,
): THREE.Object3D | null {
    if (!highlight) return null
    let found: THREE.Object3D | null = null
    root.traverse((obj) => {
        if (found) return
        if (obj.userData?.isHighlight && obj.userData?.highlightKind === highlight.kind) {
            found = obj
        }
    })
    return found
}

// Attach the right handles for the current highlight kind. Keep the
// switch tiny — each branch routes to a typed per-entity attach function.
export function attachHandlesForHighlight(
    target: THREE.Object3D,
    highlight: NonNullable<Highlight>,
): void {
    switch (highlight.kind) {
        case "classroom": attachClassroomHandles(target); return
        case "building":  attachBuildingHandles(target); return
        case "corridor":  attachCorridorHandles(target); return
        case "lift":      attachLiftHandles(target); return
        case "stairs":    attachStairsHandles(target); return
    }
}
