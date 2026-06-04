import * as THREE from "three"
import type { FullGraph } from "../../types/FullGraph"
import type { Highlight } from "../../types/three/build-scene-types"
import { buildCampusScene } from "./buildScene"
import { disposeGroup } from "./disposeGroup"
import { disposeHandleMaterials } from "../gizmo/disposeHandleMaterials"
import { diffHighlight } from "./highlightChange"
import { rebuildEntity } from "./updateEntity"
import {
    attachHandlesForHighlight,
    findHighlightTarget,
} from "../gizmo/attachHandlesForHighlight"
import type { SceneRegistry } from "./sceneRegistry"
import type { Vec3 } from "../path/pathfinder"
import { buildPathOverlay } from "../path/buildPathOverlay"

export type SceneControllerState = {
    graph: FullGraph
    highlight: Highlight
    path?: Vec3[]
}

export type SceneController = {
    /** Apply a new state (graph, highlight, dimOthers). Internally
     *  decides whether to do a full rebuild or just swap one entity. */
    apply: (state: SceneControllerState) => void
    /** The current gizmo anchor (Object3D tagged with isHighlight in
     *  userData), or null if the highlight has no matching entity. */
    getGizmoTarget: () => THREE.Object3D | null
    /** Tear down: remove campus from scene, dispose buffers/materials. */
    dispose: () => void
}

/** Owns the campus root group and a per-entity registry. Hides the
 *  full/partial-rebuild decision behind a single `apply()` call so the
 *  React component doesn't need to know about either path. */
export function createSceneController(scene: THREE.Scene): SceneController {
    let campus: THREE.Group | null = null
    let registry: SceneRegistry | null = null
    let gizmoTarget: THREE.Object3D | null = null
    let prev: SceneControllerState | null = null
    let path: THREE.Group | null = null

    const fullRebuild = (state: SceneControllerState): void => {
        if (campus) {
            disposeHandleMaterials(campus)
            scene.remove(campus)
            disposeGroup(campus)
        }

        const built = buildCampusScene(state.graph, state.highlight)
        scene.add(built.root)

        campus = built.root
        registry = built.registry
        pathRebuild(state)
        refreshGizmoTarget(state.highlight)
    }

    const partialRebuild = (
        state: SceneControllerState,
        target: { kind: NonNullable<Highlight>["kind"]; id: string },
    ): void => {
        if (!campus || !registry) {
            fullRebuild(state)
            return
        }
        rebuildEntity({
            root: campus,
            registry,
            graph: state.graph,
            highlight: state.highlight,
            kind: target.kind,
            id: target.id,
        })
        refreshGizmoTarget(state.highlight)
    }

    const pathRebuild = (state: SceneControllerState) => {
        if (!campus)
            return

        if (path) {
            campus.remove(path)
            disposeGroup(path)
        }

        if (state.path) {
            path = buildPathOverlay(state.path)
            campus.add(path)
        }
    }

    const refreshGizmoTarget = (highlight: Highlight): void => {
        gizmoTarget = null
        if (!campus || !highlight || !highlight.isEditing) return
        const target = findHighlightTarget(campus, highlight)
        if (!target) return
        attachHandlesForHighlight(target, highlight)
        gizmoTarget = target
    }

    const apply = (state: SceneControllerState): void => {
        // Graph object identity drives a full rebuild — same graph
        // instance means saved data is unchanged.
        const graphChanged = !prev || prev.graph !== state.graph
        if (graphChanged) {
            fullRebuild(state)
            prev = state
            return
        }

        const diff = diffHighlight(
            prev!.highlight,
            state.highlight
        )

        switch (diff.mode) {
            case "noop":
                break
            case "partial":
                partialRebuild(state, diff.target)
                break
            case "full":
                fullRebuild(state)
                break
        }

        if (diff.mode !== "full" && state.path !== null)
            pathRebuild(state)

        prev = state
    }

    const getGizmoTarget = (): THREE.Object3D | null => gizmoTarget

    const dispose = (): void => {
        if (campus) {
            if (path) {
                campus.remove(path)
                disposeGroup(path)
            }

            disposeHandleMaterials(campus)
            scene.remove(campus)
            disposeGroup(campus)
        }

        path = null
        campus = null
        registry = null
        gizmoTarget = null
        prev = null
    }

    return { apply, getGizmoTarget, dispose }
}
