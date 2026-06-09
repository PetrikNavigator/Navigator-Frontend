import type { Building } from "../../types/navigator/Building"
import type { Classroom } from "../../types/navigator/Classroom"
import type { Corridor } from "../../types/navigator/Corridor"
import type { Lift } from "../../types/navigator/Lift"
import type { Stair } from "../../types/navigator/Stair"
import type { FullGraph } from "../../types/FullGraph"
import type { EditTarget } from "./types"

/** Placeholder id for an entity being created (not yet saved). */
const NEW_ID = ""

const defaultClassroom = (graph: FullGraph): Classroom => ({
    id: NEW_ID, name: "új terem", capacity: 0, storey: 0,
    x: 0, y: 0, rotation: 0,
    size_x: 6, size_y: 6, size_z: 3,
    description: "",
    building_id: graph.buildings[0]?.id ?? NEW_ID,
    type_id: NEW_ID,
})

const defaultBuilding = (): Building => ({
    id: NEW_ID, name: "új épület", description: "", x: 0, y: 0,
})

const defaultLift = (graph: FullGraph): Lift => ({
    id: NEW_ID, name: "új", x: 0, y: 0,
    min_storey: 0, max_storey: 1,
    building_id: graph.buildings[0]?.id ?? NEW_ID,
})

const defaultStair = (graph: FullGraph): Stair => ({
    ...defaultLift(graph), rotation: 0,
})

const defaultCorridor = (): Corridor => ({
    id: NEW_ID, name: "", storey: 0,
    x1: 0, y1: 0, x2: 0, y2: 0, width: 0,
    barrier_free: false, is_outdoor: false,
    building_id: NEW_ID,
})

/** The edited entity's saved state (if any) merged with the in-flight
 *  preview. Used to build the live preview node + gizmo anchor without
 *  rebuilding the whole campus. Never mutates the graph. */
export type MergedEntity =
    | { kind: "classroom"; entity: Classroom }
    | { kind: "building"; entity: Building }
    | { kind: "lift"; entity: Lift }
    | { kind: "stairs"; entity: Stair }
    | { kind: "corridor"; entity: Corridor }

export function mergeEntity(graph: FullGraph, target: EditTarget): MergedEntity {
    const id = target.id
    switch (target.kind) {
        case "classroom": {
            const existing = id ? graph.classrooms.find((c) => c.id === id) : undefined
            return { kind: "classroom", entity: { ...(existing ?? defaultClassroom(graph)), ...target.preview } }
        }
        case "building": {
            const existing = id ? graph.buildings.find((b) => b.id === id) : undefined
            return { kind: "building", entity: { ...(existing ?? defaultBuilding()), ...target.preview } }
        }
        case "lift": {
            const existing = id ? graph.lifts.find((l) => l.id === id) : undefined
            return { kind: "lift", entity: { ...(existing ?? defaultLift(graph)), ...target.preview } }
        }
        case "stairs": {
            const existing = id ? graph.stairs.find((s) => s.id === id) : undefined
            return { kind: "stairs", entity: { ...(existing ?? defaultStair(graph)), ...target.preview } }
        }
        case "corridor": {
            const existing = id ? graph.corridors.find((c) => c.id === id) : undefined
            return { kind: "corridor", entity: { ...(existing ?? defaultCorridor()), ...target.preview } }
        }
    }
}
