import * as THREE from "three"
import { fillBox, wireBox } from "../../blueprint/primitives"

export type DoorArgs = {
    roomSizeY: number
    boxH: number
    color: number
    opacity: number
    lineOpacity: number
}

// Door panel placed on the room's local +Y wall, child of the rotated
// body so it stays flush regardless of door angle.
export function createClassroomDoor(args: DoorArgs): THREE.Group {
    const { roomSizeY, boxH, color, opacity, lineOpacity } = args
    const height = Math.min(2.1, boxH - 0.05)
    const width = 0.95
    const thickness = 0.08

    const group = new THREE.Group()
    const door = fillBox(width, height, thickness, color, opacity)
    door.position.set(0, -boxH * 0.5 + height * 0.5, roomSizeY * 0.5 + thickness * 0.5)
    group.add(door)

    const outline = wireBox(width, height, thickness, 0xffffff, lineOpacity)
    outline.position.copy(door.position)
    group.add(outline)

    return group
}
