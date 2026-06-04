import type { Building } from "../navigator/Building";
import type { Classroom } from "../navigator/Classroom";
import type { Corridor } from "../navigator/Corridor";
import type { Lift } from "../navigator/Lift";
import type { Stair } from "../navigator/Stair";

/**
 * Discriminated union describing what the admin is currently
 * focused on. The optional `preview` field carries unsaved form
 * edits that the scene merges in so the 3D view reflects them
 * before save (see `mergePreview`).
 *
 * `null` means "nothing highlighted" — the scene draws normally
 * with no edit affordances.
 */
export type Highlight =
    | { kind: "classroom"; isEditing: boolean; dimOthers: boolean; id?: string; preview?: Partial<Classroom> }
    | { kind: "building"; isEditing: boolean; dimOthers: boolean; id?: string; preview?: Partial<Building> }
    | { kind: "lift"; isEditing: boolean; dimOthers: boolean; id?: string; preview?: Partial<Lift> }
    | { kind: "stairs"; isEditing: boolean; dimOthers: boolean; id?: string; preview?: Partial<Stair> }
    | { kind: "corridor"; isEditing: boolean; dimOthers: boolean; id?: string; preview?: Partial<Corridor> }
    | null