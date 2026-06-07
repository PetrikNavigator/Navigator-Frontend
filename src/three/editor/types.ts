import type { Building } from "../../types/navigator/Building"
import type { Classroom } from "../../types/navigator/Classroom"
import type { Corridor } from "../../types/navigator/Corridor"
import type { Lift } from "../../types/navigator/Lift"
import type { Stair } from "../../types/navigator/Stair"

/** Editor entity kinds the gizmo can edit. Mirrors the old `Highlight`
 *  union, minus the appearance flags (those live in `EditorAppearance`). */
export type EditKind = "classroom" | "building" | "lift" | "stairs" | "corridor"

/** The entity currently being edited. `id` absent = a brand-new entity
 *  being created (no saved node to hide). `preview` carries the unsaved
 *  form edits the preview node + gizmo anchor are built from. */
export type EditTarget =
    | { kind: "classroom"; id?: string; preview: Partial<Classroom> }
    | { kind: "building"; id?: string; preview: Partial<Building> }
    | { kind: "lift"; id?: string; preview: Partial<Lift> }
    | { kind: "stairs"; id?: string; preview: Partial<Stair> }
    | { kind: "corridor"; id?: string; preview: Partial<Corridor> }

/** Restricts which entities are visible. Each field absent/`null` means
 *  "no restriction on this axis"; an empty array also means no restriction. */
export type EditorFilter = {
    buildingIds?: string[] | null
    storeys?: number[] | null
    /** Classroom type ids. Only hides non-matching classrooms; structural
     *  entities (floors/corridors/vertical assets) stay visible. */
    typeIds?: string[] | null
}

/** How to emphasize entities. `highlightIds` are accented; with
 *  `dimOthers` the rest fade. Matches against `KioskNode.id`. */
export type EditorEmphasis = {
    highlightIds?: string[]
    dimOthers?: boolean
}

/** The full appearance state applied in place every state change. */
export type EditorAppearance = {
    filter?: EditorFilter
    emphasis?: EditorEmphasis
}
