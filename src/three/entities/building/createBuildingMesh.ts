import * as THREE from "three"
import type { Building } from "../../../types/navigator/Building"
import type { RenderContext } from "../../../types/three/render-context-types"
import { storeyVisible } from "../../scene/visibility"
import { getClassroomsInBuilding, getValidStoreys } from "./buildingHelpers"
import { dimFactor, isHighlighted } from "../../scene/highlight"
import { COLORS } from "../../../types/three/color-types"
import { colorForStorey } from "../../blueprint/palette"
import { createFloor } from "./createFloorPlate"
import type { BuildingHighlightUserData } from "../../../types/three/highlight-userdata-types"
import { GetBuildingBounds } from "../../scene/bounds"

// One Object3D containing every floor plate for a building, plus a
// zero-extent gizmo anchor when the building is the active highlight.
export function createBuildingMesh(b: Building, ctx: RenderContext): THREE.Object3D {
    const group = new THREE.Group()
    const rooms = getClassroomsInBuilding(ctx.graph, b)

    const highlighted = isHighlighted(ctx.highlight, "building", b.id)
    const dim = dimFactor(highlighted, ctx.highlight?.dimOthers || false) * 0.75
    const color = highlighted ? COLORS.highlight : 0

    for (const storey of getValidStoreys(rooms)) {
        if (!storeyVisible(storey, ctx.visibleStoreys)) continue

        const bounds = GetBuildingBounds(b, ctx.graph)
        const floorPos = ctx.storeys.bottomY(b.id, storey)
        const floorColor = highlighted ? color : colorForStorey(storey)

        group.add(createFloor(bounds, storey, floorPos, floorColor, dim))
    }

    if (highlighted) {
        const anchor = new THREE.Group()
        anchor.position.set(b.x, 0, b.y)
        const data: BuildingHighlightUserData = {
            isHighlight: true,
            highlightKind: "building",
            x: b.x,
            y: b.y,
        }
        anchor.userData = data
        group.add(anchor)
    }

    return group
}
