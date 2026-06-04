import * as THREE from "three"
import type { Classroom } from "../../../types/navigator/Classroom"
import { fillBox, wireBox } from "../../blueprint/primitives"
import type { ClassroomOpacities } from "./classroomOpacities"

// Main fill box + wireframe + roof cap + base band. All sub-meshes use
// the same accent color from the classroom's type.
export function createClassroomBody(
    c: Classroom,
    boxH: number,
    color: number,
    op: ClassroomOpacities,
): THREE.Group {
    const body = new THREE.Group()

    body.add(fillBox(c.size_x, boxH, c.size_y, color, op.fill))
    body.add(wireBox(c.size_x, boxH, c.size_y, color, op.line))

    return body
}
