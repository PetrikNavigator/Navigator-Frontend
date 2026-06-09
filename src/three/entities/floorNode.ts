import * as THREE from "three"
import type { Building } from "../../types/navigator/Building"
import type { FullGraph } from "../../types/FullGraph"
import type { StoreyResolver } from "../../types/three/storey-types"
import { GetBuildingBounds } from "../scene/bounds"
import { ownFillMat, tagApp } from "../kiosk/materials"
import { KIOSK_OPACITY, kioskStoreyColor } from "../kiosk/palette"
import { makeKioskBadge } from "./badge"
import type { KioskNode } from "../kiosk/types"

const FLOOR_MARGIN = 2

/** One floor plate (+ storey badge) for a building+storey. The plate is
 *  the pickable surface a user taps to isolate the floor. */
export function buildFloorNode(
    b: Building,
    storey: number,
    graph: FullGraph,
    storeys: StoreyResolver,
): KioskNode {
    const raw = GetBuildingBounds(b, graph)
    const bounds = {
        x: raw.x - FLOOR_MARGIN,
        y: raw.y - FLOOR_MARGIN,
        w: raw.w + FLOOR_MARGIN * 2,
        h: raw.h + FLOOR_MARGIN * 2,
    }
    const floorPos = storeys.bottomY(b.id, storey)
    const color = kioskStoreyColor(storey)

    const group = new THREE.Group()

    const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(bounds.w, bounds.h),
        ownFillMat(color, KIOSK_OPACITY.floorPlate),
    )
    plate.rotation.x = -Math.PI / 2
    plate.position.set(bounds.x + bounds.w * 0.5, floorPos - 0.01, bounds.y + bounds.h * 0.5)
    plate.renderOrder = -1
    tagApp(plate, "plate", color, KIOSK_OPACITY.floorPlate)
    group.add(plate)

    const badge = makeKioskBadge(storey, 0xdddddd)
    badge.position.set(bounds.x, floorPos + 1, bounds.y)
    badge.scale.set(5, 5, 1)
    group.add(badge)

    return {
        kind: "floor",
        id: b.id,
        buildingId: b.id,
        storey,
        object: group,
        appearance: [plate],
        pickables: [plate],
        center: new THREE.Vector3(plate.position.x, floorPos, plate.position.z),
    }
}
