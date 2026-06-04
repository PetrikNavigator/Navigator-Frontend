export type ClassroomOpacities = {
    fill: number
    cap: number
    band: number
    door: number
    line: number
}

// Single source of truth for "selected vs context" alpha values per
// classroom sub-mesh. Mirrors what Classroom.gd uses in the Godot project.
export function computeClassroomOpacities(highlighted: boolean, dim: number): ClassroomOpacities {
    return {
        fill: (highlighted ? 0.88 : 0.55) * dim,
        cap:  (highlighted ? 1.00 : 0.95) * dim,
        band: 0.40 * dim,
        door: (highlighted ? 0.95 : 0.85) * dim,
        line: dim,
    }
}
