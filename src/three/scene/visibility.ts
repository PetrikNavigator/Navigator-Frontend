import type { Highlight } from "../../types/three/build-scene-types"
import type { StoreyRange } from "../../types/three/render-context-types"

// While editing, hide floors outside the active entity's storey range so
// only the level being edited is visible. `null` means "show everything".
export function computeVisibleStoreys(
    highlight: Highlight,
): StoreyRange | null {
    if (!highlight || !highlight.preview) return null

    if (highlight.kind === "classroom" || highlight.kind === "corridor") {
        const s = (highlight.preview as { storey?: number }).storey
        return typeof s === "number" ? { min: s, max: s } : null
    }

    if (highlight.kind === "lift" || highlight.kind === "stairs") {
        const p = highlight.preview as { min_storey?: number; max_storey?: number }
        if (typeof p.min_storey === "number" && typeof p.max_storey === "number") {
            return {
                min: Math.min(p.min_storey, p.max_storey),
                max: Math.max(p.min_storey, p.max_storey),
            }
        }
    }

    return null
}

export function storeyVisible(s: number, range: StoreyRange | null): boolean {
    return range === null || (s >= range.min && s <= range.max)
}

export function rangeVisible(lo: number, hi: number, range: StoreyRange | null): boolean {
    return range === null || !(hi < range.min || lo > range.max)
}
