import * as THREE from "three"
import type { FullGraph } from "../../types/FullGraph"
import type { StoreyResolver } from "../../types/three/storey-types"
import { buildStoreyResolver } from "../scene/storeyResolver"
import { buildKioskCampus } from "../entities/buildKioskCampus"
import { disposeDeep } from "../kiosk/materials"
import type { KioskNode } from "../kiosk/types"
import { disposeHandleMaterials } from "../gizmo/disposeHandleMaterials"
import { attachBuildingHandles } from "../gizmo/handles/attachBuildingHandles"
import { attachClassroomHandles } from "../gizmo/handles/attachClassroomHandles"
import { attachCorridorHandles } from "../gizmo/handles/attachCorridorHandles"
import {
    attachLiftHandles,
    attachStairsHandles,
} from "../gizmo/handles/attachVerticalAssetHandles"
import { accentNode, applyEditorAppearance } from "./appearance"
import { buildEditAnchor } from "./anchors"
import { mergeEntity } from "./merge"
import { buildPreviewNode } from "./previewNode"
import type { EditKind, EditorAppearance, EditTarget } from "./types"

/** Owns the campus geometry for the editor. Geometry is built once per
 *  graph; appearance (filter/highlight/dim) is a cheap in-place pass; the
 *  single entity being edited gets a live preview node + an invisible
 *  gizmo anchor — neither touches the rest of the campus. */
export type EditorSceneController = {
    setGraph: (graph: FullGraph | null) => void
    applyAppearance: (app: EditorAppearance) => void
    /** Show/clear the gizmo + live preview for one entity. */
    setEdit: (target: EditTarget | null) => void
    /** The current gizmo anchor (handle-bearing Object3D), or null. */
    getGizmoTarget: () => THREE.Object3D | null
    dispose: () => void
}

function attachHandles(anchor: THREE.Object3D, kind: EditKind): void {
    switch (kind) {
        case "classroom": attachClassroomHandles(anchor); return
        case "building": attachBuildingHandles(anchor); return
        case "corridor": attachCorridorHandles(anchor); return
        case "lift": attachLiftHandles(anchor); return
        case "stairs": attachStairsHandles(anchor); return
    }
}

export function createEditorScene(scene: THREE.Scene): EditorSceneController {
    let root: THREE.Group | null = null
    let nodes: KioskNode[] = []
    let nodesByKey = new Map<string, KioskNode>()
    let graphRef: FullGraph | null = null
    let storeys: StoreyResolver | null = null

    // Live-edit state.
    let previewNode: KioskNode | null = null
    let anchor: THREE.Object3D | null = null
    let hiddenOriginal: KioskNode | null = null
    // Building moves are previewed by translating its existing nodes.
    let buildingShift: { dx: number; dz: number; moved: KioskNode[] } | null = null

    const keyOf = (kind: string, id: string): string => `${kind}:${id}`

    const clearEdit = (): void => {
        if (previewNode) {
            previewNode.object.parent?.remove(previewNode.object)
            disposeDeep(previewNode.object)
            previewNode = null
        }
        if (anchor) {
            disposeHandleMaterials(anchor)
            anchor.parent?.remove(anchor)
            disposeDeep(anchor)
            anchor = null
        }
        if (hiddenOriginal) {
            hiddenOriginal.object.visible = true
            hiddenOriginal = null
        }
        if (buildingShift) {
            for (const n of buildingShift.moved) {
                n.object.position.x -= buildingShift.dx
                n.object.position.z -= buildingShift.dz
            }
            buildingShift = null
        }
    }

    const clearGraph = (): void => {
        clearEdit()
        if (root) {
            scene.remove(root)
            disposeDeep(root)
        }
        root = null
        nodes = []
        nodesByKey = new Map()
        storeys = null
    }

    const setGraph = (graph: FullGraph | null): void => {
        if (graph === graphRef) return
        graphRef = graph
        clearGraph()
        if (!graph) return
        const built = buildKioskCampus(graph)
        root = built.root
        nodes = built.nodes
        nodesByKey = new Map(nodes.map((n) => [keyOf(n.kind, n.id), n]))
        storeys = buildStoreyResolver(graph.classrooms)
        scene.add(root)
    }

    const applyAppearance = (app: EditorAppearance): void => {
        applyEditorAppearance(nodes, app)
        // Keep the edited entity's original hidden under the preview node.
        if (hiddenOriginal) hiddenOriginal.object.visible = false
    }

    const setEdit = (target: EditTarget | null): void => {
        clearEdit()
        if (!target || !root || !graphRef || !storeys) return

        const merged = mergeEntity(graphRef, target)

        if (merged.kind === "building") {
            // Preview a building move by translating its existing nodes.
            if (target.id) {
                const saved = graphRef.buildings.find((b) => b.id === target.id)
                if (saved) {
                    const dx = merged.entity.x - saved.x
                    const dz = merged.entity.y - saved.y
                    if (dx !== 0 || dz !== 0) {
                        const moved = nodes.filter((n) => n.buildingId === target.id)
                        for (const n of moved) {
                            n.object.position.x += dx
                            n.object.position.z += dz
                        }
                        buildingShift = { dx, dz, moved }
                    }
                }
            }
        } else {
            // Hide the saved node and render the in-flight preview in its place.
            if (target.id) {
                const original = nodesByKey.get(keyOf(target.kind, target.id))
                if (original) {
                    original.object.visible = false
                    hiddenOriginal = original
                }
            }
            const node = buildPreviewNode(merged, graphRef, storeys)
            if (node) {
                accentNode(node)
                root.add(node.object)
                previewNode = node
            }
        }

        const a = buildEditAnchor(merged, graphRef, storeys)
        if (a) {
            root.add(a)
            attachHandles(a, target.kind)
            anchor = a
        }
    }

    return {
        setGraph,
        applyAppearance,
        setEdit,
        getGizmoTarget: () => anchor,
        dispose: clearGraph,
    }
}
