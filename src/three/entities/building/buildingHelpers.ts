import type { Building } from "../../../types/navigator/Building"
import type { Classroom } from "../../../types/navigator/Classroom"
import type { FullGraph } from "../../../types/FullGraph"
import { FLOOR_GAP } from "../../scene/storeyResolver"

export function getClassroomsInBuilding(graph: FullGraph, building: Building): Classroom[] {
    return graph.classrooms.filter((c) => c.building_id === building.id)
}

export function getValidStoreys(rooms: Classroom[]): number[] {
    const set = new Set<number>()
    set.add(0)
    for (const r of rooms) set.add(r.storey)
    return Array.from(set)
}

export function floorPositionOf(graph: FullGraph, buildingId: string, storey: number): number {
    let startPos = 0
    if (storey >= 0) {
        for (let i = 0; i < storey; i++) startPos += ceilingHeight(graph, buildingId, i) + FLOOR_GAP
    } else {
        for (let i = -1; i >= storey; i--) startPos -= ceilingHeight(graph, buildingId, i) + FLOOR_GAP
    }
    return startPos
}

function ceilingHeight(graph: FullGraph, buildingId: string, storey: number): number {
    let maxH = 0
    for (const c of graph.classrooms) {
        if (c.building_id === buildingId && c.storey === storey && c.size_z > maxH) {
            maxH = c.size_z
        }
    }
    return maxH
}