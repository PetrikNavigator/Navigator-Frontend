import type * as THREE from "three"
import type { Highlight } from "../../types/three/build-scene-types"

export type EntityKind = NonNullable<Highlight>["kind"]
export type EntityKey = `${EntityKind}:${string}`

/** Identity for one entity slot in the scene tree. */
export function entityKey(kind: EntityKind, id: string): EntityKey {
    return `${kind}:${id}`
}

/** Map from entityKey → the top-level Object3D returned by that entity's
 *  builder. Used so a single entity can be swapped without rebuilding
 *  the rest of the campus. */
export type SceneRegistry = Map<EntityKey, THREE.Object3D>

export function createSceneRegistry(): SceneRegistry {
    return new Map()
}

/** Tag an Object3D with its entity coordinates so we can recover them
 *  during traversal. Mirrors highlight userData on a different field
 *  so they don't collide. */
export function tagEntity(
    obj: THREE.Object3D,
    kind: EntityKind,
    id: string,
): void {
    obj.userData.entityKind = kind
    obj.userData.entityId = id
    obj.userData.entityKey = entityKey(kind, id)
}
