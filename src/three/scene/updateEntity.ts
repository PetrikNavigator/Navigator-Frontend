import * as THREE from "three"
import type { FullGraph } from "../../types/FullGraph"
import type { Highlight } from "../../types/three/build-scene-types"
import { disposeGroup } from "./disposeGroup"
import { disposeHandleMaterials } from "../gizmo/disposeHandleMaterials"
import { buildEntityByKey } from "./entityRegistry"
import { buildRenderContext } from "./renderContext"
import { mergePreview } from "./mergePreview"
import { entityKey, type EntityKey, type EntityKind, type SceneRegistry } from "./sceneRegistry"

export type RebuildEntityArgs = {
    root: THREE.Group
    registry: SceneRegistry
    graph: FullGraph
    highlight: Highlight
    kind: EntityKind
    id: string
}

/** Replace exactly one entity in the campus root. Disposes the old
 *  geometry + gizmo materials, builds the new object from the previewed
 *  graph, and updates the registry. Returns the new Object3D (or null
 *  if the entity no longer exists in the merged graph). */
export function rebuildEntity(args: RebuildEntityArgs): THREE.Object3D | null {
    const { root, registry, graph, highlight, kind, id } = args
    const key: EntityKey = entityKey(kind, id)
    const prev = registry.get(key)

    if (prev) {
        disposeHandleMaterials(prev)
        root.remove(prev)
        disposeGroup(prev)
        registry.delete(key)
    }

    const work = mergePreview(graph, highlight)
    const ctx = buildRenderContext(work, highlight)
    const next = buildEntityByKey(kind, id, ctx)
    if (!next) return null

    registry.set(key, next)
    root.add(next)
    return next
}
