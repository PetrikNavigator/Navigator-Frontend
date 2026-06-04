import type { Building } from "../../types/navigator/Building"
import type { Classroom } from "../../types/navigator/Classroom"
import type { Corridor } from "../../types/navigator/Corridor"
import type { Lift } from "../../types/navigator/Lift"
import type { Stair } from "../../types/navigator/Stair"
import type { FullGraph } from "../../types/FullGraph"
import type { Highlight } from "../../types/three/build-scene-types"
import { NEW_ENTITY_ID } from "./highlight"

// Sensible defaults when a brand-new entity is being created. The id
// matches NEW_ENTITY_ID so isHighlighted() picks the synthetic entity up.
const defaultClassroom = (graph: FullGraph): Classroom => ({
    id: NEW_ENTITY_ID, name: "új terem", capacity: 0, storey: 0,
    x: 0, y: 0, rotation: 0,
    size_x: 6, size_y: 6, size_z: 3,
    description: "",
    building_id: graph.buildings[0]?.id ?? NEW_ENTITY_ID,
    type_id: NEW_ENTITY_ID,
})

const defaultBuilding = (): Building => ({
    id: NEW_ENTITY_ID, name: "új épület", description: "", x: 0, y: 0, premise_id: NEW_ENTITY_ID,
})

const defaultLift = (graph: FullGraph): Lift => ({
    id: NEW_ENTITY_ID, name: "új", x: 0, y: 0,
    min_storey: 0, max_storey: 1,
    building_id: graph.buildings[0]?.id ?? NEW_ENTITY_ID,
})

const defaultStair = (graph: FullGraph): Stair => ({
    ...defaultLift(graph), rotation: 0,
})

const defaultCorridor = (): Corridor => ({
    id: NEW_ENTITY_ID, name: "", storey: 0,
    x1: 0, y1: 0, x2: 0, y2: 0, width: 0,
    barrier_free: false, is_outdoor: false,
    building_id: NEW_ENTITY_ID,
})

function mergeClassroom(graph: FullGraph, id: string, preview: Partial<Classroom>): FullGraph {
    const existing = graph.classrooms.find((c) => c.id === id)
    const merged: Classroom = { ...(existing ?? defaultClassroom(graph)), ...preview }
    const others = graph.classrooms.filter((c) => c.id !== id)
    return { ...graph, classrooms: [...others, merged] }
}

function mergeBuilding(graph: FullGraph, id: string, preview: Partial<Building>): FullGraph {
    const existing = graph.buildings.find((b) => b.id === id)
    const merged: Building = { ...(existing ?? defaultBuilding()), ...preview }
    const others = graph.buildings.filter((b) => b.id !== id)
    return { ...graph, buildings: [...others, merged] }
}

function mergeLift(graph: FullGraph, id: string, preview: Partial<Lift>): FullGraph {
    const existing = graph.lifts.find((l) => l.id === id)
    const merged: Lift = { ...(existing ?? defaultLift(graph)), ...preview }
    const others = graph.lifts.filter((l) => l.id !== id)
    return { ...graph, lifts: [...others, merged] }
}

function mergeStair(graph: FullGraph, id: string, preview: Partial<Stair>): FullGraph {
    const existing = graph.stairs.find((s) => s.id === id)
    const merged: Stair = { ...(existing ?? defaultStair(graph)), ...preview }
    const others = graph.stairs.filter((s) => s.id !== id)
    return { ...graph, stairs: [...others, merged] }
}

function mergeCorridor(graph: FullGraph, id: string, preview: Partial<Corridor>): FullGraph {
    const existing = graph.corridors.find((c) => c.id === id)
    const merged: Corridor = { ...(existing ?? defaultCorridor()), ...preview }
    const others = graph.corridors.filter((c) => c.id !== id)
    return { ...graph, corridors: [...others, merged] }
}

// Apply the highlight's in-flight preview to a copy of the graph so the
// 3D view reflects unsaved form edits in real time. Never mutates input.
export function mergePreview(graph: FullGraph, highlight: Highlight): FullGraph {
    if (!highlight || !highlight.preview) return graph
    const id = highlight.id ?? NEW_ENTITY_ID
    switch (highlight.kind) {
        case "classroom": return mergeClassroom(graph, id, highlight.preview)
        case "building":  return mergeBuilding(graph, id, highlight.preview)
        case "lift":      return mergeLift(graph, id, highlight.preview)
        case "stairs":    return mergeStair(graph, id, highlight.preview)
        case "corridor":  return mergeCorridor(graph, id, highlight.preview)
        default:          return graph
    }
}
