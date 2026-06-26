import type { Classroom } from "../types/navigator/Classroom"
import type { FullGraph } from "../types/FullGraph"

/** Combining diacritical marks, stripped after NFD. */
const COMBINING_MARKS = /\p{Diacritic}/gu

/** Translator function (i18next `t`) used to resolve entity codenames. */
export type Translator = (key: string, options?: Record<string, unknown>) => string

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
    /** Localized floor label, e.g. "2. emelet" / "Földszint". */
    floorLabel: string
}

/** Resolve a localized floor label for a storey number. */
export function storeyLabel(storey: number, t: Translator): string {
    if (storey === 0) return t("ui.floor.ground")
    if (storey < 0) return t("ui.floor.basement", { n: Math.abs(storey) })
    return t("ui.floor.upper", { n: storey })
}

/** Resolve the type/building/floor display info for a classroom. */
export function classroomInfo(graph: FullGraph, c: Classroom, t: Translator): ClassroomInfo {
    const type = graph.classroom_types.find((ct) => ct.id === c.type_id)
    const building = graph.buildings.find((b) => b.id === c.building_id)
    return {
        classroom: c,
        typeName: type ? t(type.name) : t("ui.common.unknown_type"),
        typeColor: type?.colorhex || "#888888",
        buildingName: building ? t(building.name) : "?",
        floorLabel: storeyLabel(c.storey, t),
    }
}

/**
 * Match classrooms by name OR description (accent/case-insensitive). An
 * empty query returns every classroom. Names, descriptions and type names are
 * translated through `t` before matching so search works in the active
 * language.
 */
export function searchClassrooms(graph: FullGraph | null, query: string, t: Translator): Classroom[] {
    const rooms = graph?.classrooms ?? []
    const q = normalize(query)

    const values: Classroom[] = []
    for (const c of rooms) {

        if (normalize(t(c.name)).includes(q)) {
            values.push(c)
            continue
        }

        if (normalize(t(c.description)).includes(q)) {
            values.push(c)
            continue
        }

        if (!graph)
            continue

        const info = classroomInfo(graph, c, t)
        if (normalize(info.typeName).includes(q)) {
            values.push(c)
            continue
        }
    }

    return values
}
