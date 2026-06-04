import * as THREE from "three"
import type { FullGraph } from "../../types/FullGraph"
import type { Highlight } from "../../types/three/build-scene-types"
import { mergePreview } from "./mergePreview"
import { computeCampusCenter } from "./bounds"
import { buildRenderContext } from "./renderContext"
import { appendEntities } from "./entityRegistry"
import { createSceneRegistry, type SceneRegistry } from "./sceneRegistry"

export type BuiltCampus = {
    root: THREE.Group
    registry: SceneRegistry
}

export function buildCampusScene(
    graph: FullGraph,
    highlight: Highlight
): BuiltCampus {
    const root = new THREE.Group()
    const registry = createSceneRegistry()

    const work = mergePreview(graph, highlight)
    const ctx = buildRenderContext(work, highlight)

    appendEntities(root, ctx, registry)

    const center = computeCampusCenter(graph)
    root.position.set(-center.x, 0, -center.y)
    return { root, registry }
}
