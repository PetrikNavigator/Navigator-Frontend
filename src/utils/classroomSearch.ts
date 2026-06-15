import type { Classroom } from "../types/navigator/Classroom"
import type { FullGraph } from "../types/FullGraph"

/** Combining diacritical marks (U+0300–U+036F), stripped after NFD. */
const COMBINING_MARKS = /[̀-ͯ]/g

/** Lowercase + strip diacritics so "Á" matches "a" (Hungarian-friendly). */
export function normalize(s: string): string {
    return s
        .toLocaleLowerCase("hu")
        .normalize("NFD")
        .replace(COMBINING_MARKS, "")
        .trim()
}

/** A classroom plus the display strings the kiosk shows alongside it. */
export type ClassroomInfo = {
    classroom: Classroom
    typeName: string
    typeColor: string
    buildingName: string
    /** Human floor label, e.g. "2. emelet" / "Földszint". */
    floorLabel: string
}

export function storeyLabel(storey: number): string {
    if (storey === 0) return "Földszint"
    if (storey < 0) return `${Math.abs(storey)}. alagsor`
    return `${storey}. emelet`
}

/** Resolve the type/building/floor display info for a classroom. */
export function classroomInfo(graph: FullGraph, c: Classroom): ClassroomInfo {
    const type = graph.classroom_types.find((t) => t.id === c.type_id)
    const building = graph.buildings.find((b) => b.id === c.building_id)
    return {
        classroom: c,
        typeName: type?.name ?? "Ismeretlen típus",
        typeColor: type?.colorhex || "#888888",
        buildingName: building?.name ?? "?",
        floorLabel: storeyLabel(c.storey),
    }
}

/**
 * Match classrooms by name OR description (accent/case-insensitive). An
 * empty query returns every classroom (sorted by name). Matches are ranked:
 * name-prefix, then name-substring, then description.
 */
export function searchClassrooms(graph: FullGraph | null, query: string): Classroom[] {
    const rooms = graph?.classrooms ?? []
    const q = normalize(query)
    if (!q) return [...rooms].sort((a, b) => a.name.localeCompare(b.name, "hu"))

    type Ranked = { c: Classroom; rank: number }
    const out: Ranked[] = []
    for (const c of rooms) {
        const name = normalize(c.name)
        const desc = normalize(c.description ?? "")
        let rank = -1
        if (name.startsWith(q)) rank = 0
        else if (name.includes(q)) rank = 1
        else if (desc.includes(q)) rank = 2
        if (rank >= 0) out.push({ c, rank })
    }
    return out
        .sort((a, b) => a.rank - b.rank || a.c.name.localeCompare(b.c.name, "hu"))
        .map((r) => r.c)
}
