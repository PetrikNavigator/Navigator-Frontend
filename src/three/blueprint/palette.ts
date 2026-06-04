import type { FullGraph } from "../../types/FullGraph"
import { STOREY_PALETTE } from "../../types/three/color-types"

// Cyclic storey color; handles negative storeys via the `((n%p)+p)%p` idiom.
export function colorForStorey(storey: number): number {
    const n = STOREY_PALETTE.length
    return STOREY_PALETTE[((storey % n) + n) % n]
}

export function colorForType(graph: FullGraph, typeId: string): number {
    const type = graph.classroom_types.find((x) => x.id === typeId)
    if (!type) return 0
    return Number(type.colorhex.replace("#", "0x").slice(0, 8))
}
