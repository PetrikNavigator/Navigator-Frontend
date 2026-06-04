import * as THREE from "three"
import type { FullGraph } from "../../types/FullGraph"
import type { RenderContext } from "../../types/three/render-context-types"
import type { EntityKind, SceneRegistry } from "./sceneRegistry"
import { entityKey, tagEntity } from "./sceneRegistry"
import { createBuildingMesh } from "../entities/building/createBuildingMesh"
import { createClassroomMesh } from "../entities/classroom/createClassroomMesh"
import { createCorridorMesh } from "../entities/corridor/createCorridorMesh"
import { createLiftMesh } from "../entities/verticalAsset/createLiftMesh"
import { createStairsMesh } from "../entities/verticalAsset/createStairsMesh"

// One entry per kind: how to fetch items from a graph and how to build a
// single one. Adding a new entity = adding one row here.
type EntityBuilder<T extends { id: string }> = {
    kind: EntityKind
    items: (g: FullGraph) => readonly T[]
    build: (item: T, ctx: RenderContext) => THREE.Object3D
}

function entity<T extends { id: string }>(
    kind: EntityKind,
    items: (g: FullGraph) => readonly T[],
    build: (item: T, ctx: RenderContext) => THREE.Object3D,
): EntityBuilder<T> {
    return { kind, items, build }
}

// Order matters: floor plates first (they sit at renderOrder -1 anyway,
// but staying consistent with the Godot side keeps debugging simple),
// then corridors, then classrooms, then vertical assets.
const ENTITY_BUILDERS: readonly EntityBuilder<any>[] = [
    entity("building", (g) => g.buildings, createBuildingMesh),
    entity("corridor", (g) => g.corridors, createCorridorMesh),
    entity("classroom", (g) => g.classrooms, createClassroomMesh),
    entity("lift", (g) => g.lifts, createLiftMesh),
    entity("stairs", (g) => g.stairs, createStairsMesh),
]

const BUILDER_BY_KIND = new Map<EntityKind, EntityBuilder<any>>(
    ENTITY_BUILDERS.map((b) => [b.kind, b]),
)

/** Build every entity, attach to `root`, and tag each top-level object
 *  with its entityKey so partial updates can find and replace it. */
export function appendEntities(
    root: THREE.Group,
    ctx: RenderContext,
    registry: SceneRegistry,
): void {
    for (const builder of ENTITY_BUILDERS) {
        for (const item of builder.items(ctx.graph)) {
            const obj = builder.build(item, ctx)
            tagEntity(obj, builder.kind, item.id)
            registry.set(entityKey(builder.kind, item.id), obj)
            root.add(obj)
        }
    }
}

/** Build a single entity by (kind, id) from the current graph. Returns
 *  null if no item with that id exists. Used by partial updates. */
export function buildEntityByKey(
    kind: EntityKind,
    id: string,
    ctx: RenderContext,
): THREE.Object3D | null {
    const builder = BUILDER_BY_KIND.get(kind)
    if (!builder) return null
    const item = builder.items(ctx.graph).find((it) => it.id === id)
    if (!item) return null
    const obj = builder.build(item, ctx)
    tagEntity(obj, kind, id)
    return obj
}

export { ENTITY_BUILDERS }
