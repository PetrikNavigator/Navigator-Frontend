import { COLORS, STOREY_PALETTE } from "../../types/three/color-types"
import type { FullGraph } from "../../types/FullGraph"

/** Kiosk accent colors. Selection endpoints reuse the path overlay's
 *  cyan/pink so the 3D markers and the route line agree. */
export const KIOSK_COLORS = {
    start: 0x55ddff,
    end: 0xff5577,
    highlight: 0xffe14d,
    floorPlate: STOREY_PALETTE,
    corridor: COLORS.corridor,
    yard: COLORS.yard,
    lift: COLORS.lift,
    stairs: COLORS.stairs,
    classroomFallback: 0x6f8aa8,
}

/** Base alpha per role, before any state factor. Tuned so floor plates
 *  read as ground, rooms read as solid, lines stay crisp. */
export const KIOSK_OPACITY = {
    floorPlate: 0.18,
    fill: 0.5,
    line: 0.85,
    door: 0.85,
    doorLine: 0.9,
    deck: 0.7,
}

export function kioskStoreyColor(storey: number): number {
    const n = KIOSK_COLORS.floorPlate.length
    return KIOSK_COLORS.floorPlate[((storey % n) + n) % n]
}

/** Classroom base color from its type's colorhex, with a neutral
 *  fallback when the type is missing or has no usable color. */
export function kioskTypeColor(graph: FullGraph, typeId: string): number {
    const type = graph.classroom_types.find((t) => t.id === typeId)
    if (!type?.colorhex) return KIOSK_COLORS.classroomFallback
    const parsed = Number(type.colorhex.replace("#", "0x").slice(0, 8))
    return Number.isFinite(parsed) ? parsed : KIOSK_COLORS.classroomFallback
}
