import type { Highlight } from "../../types/three/build-scene-types"

// Sentinel id for a brand-new entity that has no server id yet. Must
// match the synthetic id mergePreview.ts assigns to its defaults.
export const NEW_ENTITY_ID = "0"

// True when the given (kind, id) is the current highlight target. When
// highlight.id is missing (a new entity not yet saved) it falls back to
// NEW_ENTITY_ID so the synthetic preview entity matches.
export function isHighlighted(
    highlight: Highlight,
    kind: NonNullable<Highlight>["kind"],
    id: string | undefined,
): boolean {
    if (!highlight || highlight.kind !== kind) return false
    if (id == null) return false
    return id === (highlight.id ?? NEW_ENTITY_ID)
}

// Per-object opacity factor for "edit focus" mode.
export function dimFactor(isHl: boolean, dimOthers: boolean): number {
    return dimOthers && !isHl ? 0.12 : 1
}
