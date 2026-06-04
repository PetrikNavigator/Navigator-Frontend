import * as THREE from "three"
import type { Classroom } from "../../../types/navigator/Classroom"
import type { ClassroomHighlightUserData } from "../../../types/three/highlight-userdata-types"
import { FLOOR_HEIGHT } from "../../../types/three/material-types"
import { COLORS } from "../../../types/three/color-types"
import type { RenderContext } from "../../../types/three/render-context-types"
import { colorForType } from "../../blueprint/palette"
import { isHighlighted, dimFactor } from "../../scene/highlight"
import { storeyVisible } from "../../scene/visibility"
import { createClassroomBody } from "./createClassroomBody"
import { createClassroomDoor } from "./createClassroomDoor"
import { computeClassroomOpacities } from "./classroomOpacities"

// Build the visual for one classroom. The group's pivot is the room's
// center, so rotation gizmo spins around the middle (door follows).
export function createClassroomMesh(c: Classroom, ctx: RenderContext): THREE.Object3D {
    if (!storeyVisible(c.storey, ctx.visibleStoreys)) return new THREE.Group()
    const b = ctx.buildingsById.get(c.building_id)
    if (!b) return new THREE.Group()

    const highlighted = isHighlighted(ctx.highlight, "classroom", c.id)
    const dim = dimFactor(highlighted, ctx.highlight?.dimOthers || false)
    const op = computeClassroomOpacities(highlighted, dim)
    const color = highlighted ? COLORS.highlight : colorForType(ctx.graph, c.type_id)
    const boxH = Math.min(c.size_z, FLOOR_HEIGHT)
    const storeyY = ctx.storeys.bottomY(b.id, c.storey)

    const body = createClassroomBody(c, boxH, color, op)
    body.add(createClassroomDoor({
        roomSizeY: c.size_y,
        boxH,
        color: highlighted ? 0xffcc33 : 0xd99a1f,
        opacity: op.door,
        lineOpacity: op.line,
    }))

    body.position.set(b.x + c.x, storeyY + boxH * 0.5, b.y + c.y)
    body.rotation.y = -((c.rotation ?? 0) * Math.PI) / 180

    if (highlighted) {
        const data: ClassroomHighlightUserData = {
            isHighlight: true,
            highlightKind: "classroom",
            size_x: c.size_x,
            size_y: c.size_y,
            size_z: c.size_z,
            boxH,
            x: c.x,
            y: c.y,
            rotation: c.rotation ?? 0,
        }
        body.userData = data
    }

    return body
}
