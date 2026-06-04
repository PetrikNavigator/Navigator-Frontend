import type { Highlight } from "../../types/three/build-scene-types"
import type { StoreyRange } from "../../types/three/render-context-types"
import { NEW_ENTITY_ID } from "./highlight"
import { computeVisibleStoreys } from "./visibility"

/** Resolved target identity (kind + id) for a highlight, using the
 *  new-entity sentinel when no id is present. Null when nothing is
 *  highlighted. */
export type HighlightTarget = { kind: NonNullable<Highlight>["kind"]; id: string } | null

export function resolveHighlightTarget(h: Highlight): HighlightTarget {
    if (!h) return null
    return { kind: h.kind, id: h.id ?? NEW_ENTITY_ID }
}

function sameTarget(a: HighlightTarget, b: HighlightTarget): boolean {
    if (a === null || b === null) return a === b
    return a.kind === b.kind && a.id === b.id
}

function sameRange(a: StoreyRange | null, b: StoreyRange | null): boolean {
    if (a === null || b === null) return a === b
    return a.min === b.min && a.max === b.max
}

export type HighlightDiff =
    /** Same target, same visibility — only the target entity needs rebuilding. */
    | { mode: "partial"; target: NonNullable<HighlightTarget> }
    /** Target switched, dim mode changed, or visibility range changed
     *  — every entity may look different. */
    | { mode: "full" }
    /** Nothing changed visually — skip work entirely. */
    | { mode: "noop" }

/** Decide whether a highlight transition can be handled by rebuilding a
 *  single entity, or whether the whole campus needs to be rebuilt.
 *
 *  Partial path requires:
 *    - same target (kind + id)
 *    - same dimOthers flag
 *    - same visibleStoreys range (so other entities' visibility is unchanged)
 *  Otherwise: full rebuild. */
export function diffHighlight(
    prev: Highlight,
    next: Highlight,
): HighlightDiff {
    if (prev === next) return { mode: "noop" }
    
    const prevTarget = resolveHighlightTarget(prev)
    const nextTarget = resolveHighlightTarget(next)

    if(next?.isEditing || prev?.isEditing === !next?.isEditing) return { mode: "full" }

    if (prev?.dimOthers !== next?.dimOthers) return { mode: "full" }
    if (!sameTarget(prevTarget, nextTarget)) return { mode: "full" }
    if (nextTarget === null) return { mode: "noop" }

    const prevRange = computeVisibleStoreys(prev)
    const nextRange = computeVisibleStoreys(next)
    if (!sameRange(prevRange, nextRange)) return { mode: "full" }

    return { mode: "partial", target: nextTarget }
}
