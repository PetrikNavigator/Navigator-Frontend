import * as THREE from "three"
import { type LocalBounds } from "../../scene/bounds"
import { makeStoreyBadge } from "../../blueprint/storeyBadge"
import { fillMat } from "../../blueprint/materials"

const FLOOR_MARGIN = 2

function createFloorPlate(bounds: LocalBounds, floorPos: number, color: number, opacity: number): THREE.Mesh {
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(bounds.w, bounds.h),
        fillMat(color, opacity)
    )

    plane.rotation.x = -Math.PI / 2

    plane.position.x = bounds.x + bounds.w * 0.5
    plane.position.y = floorPos - 0.01
    plane.position.z = bounds.y + bounds.h * 0.5
    
    plane.renderOrder = -1

    return plane
}

function createFloorBadge(bounds: LocalBounds, storey: number, floorPos: number, color: number): THREE.Sprite {
    const sprite = makeStoreyBadge(storey, color)
    sprite.position.set(bounds.x, floorPos + 1, bounds.y)
    sprite.scale.set(5, 5, 1)
    return sprite
}

export function createFloor(bounds: LocalBounds, storey: number, floorPos: number, color: number, opacity: number): THREE.Object3D {
    const group = new THREE.Group()
    bounds.x -= FLOOR_MARGIN
    bounds.y -= FLOOR_MARGIN
    bounds.w += FLOOR_MARGIN * 2
    bounds.h += FLOOR_MARGIN * 2

    group.add(createFloorPlate(bounds, floorPos, color, opacity))
    group.add(createFloorBadge(bounds, storey, floorPos, 0xdddddd))

    return group
}
