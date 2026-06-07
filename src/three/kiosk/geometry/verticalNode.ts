import * as THREE from "three"
import type { Building } from "../../../types/navigator/Building"
import type { Lift } from "../../../types/navigator/Lift"
import type { Stair } from "../../../types/navigator/Stair"
import type { StoreyResolver } from "../../../types/three/storey-types"
import { computeShaftBounds } from "../../entities/verticalAsset/verticalAssetCommon"
import { buildStairProfile, type StairProfile } from "../../entities/verticalAsset/stairProfile"
import { ownLineMat, tagApp } from "../materials"
import { KIOSK_COLORS, KIOSK_OPACITY } from "../palette"
import type { KioskNode } from "../types"

const FOOTPRINT = 1.0
const STAIR_WIDTH = 2.5

/** Lift shaft: outline box spanning its storeys + per-deck "stops here"
 *  squares with an X. */
export function buildLiftNode(
    lift: Lift,
    b: Building,
    storeys: StoreyResolver,
): KioskNode | null {
    const bounds = computeShaftBounds(b.id, storeys, lift.min_storey, lift.max_storey)
    if (bounds.height <= 0) return null

    const color = KIOSK_COLORS.lift
    const cx = b.x + lift.x
    const cz = b.y + lift.y
    const group = new THREE.Group()

    const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(FOOTPRINT, bounds.height, FOOTPRINT)),
        ownLineMat(color, KIOSK_OPACITY.line),
    )
    wire.position.set(cx, bounds.bottom + bounds.height * 0.5, cz)
    tagApp(wire, "line", color, KIOSK_OPACITY.line)
    group.add(wire)

    const half = FOOTPRINT * 0.5
    const deckSegs: THREE.Vector3[] = []
    for (let s = lift.min_storey; s <= lift.max_storey; s++) {
        const ys = storeys.bottomY(b.id, s)
        const corners = [
            new THREE.Vector3(cx - half, ys, cz - half),
            new THREE.Vector3(cx + half, ys, cz - half),
            new THREE.Vector3(cx + half, ys, cz + half),
            new THREE.Vector3(cx - half, ys, cz + half),
        ]
        for (let i = 0; i < 4; i++) deckSegs.push(corners[i], corners[(i + 1) % 4])
        deckSegs.push(corners[0], corners[2], corners[1], corners[3])
    }
    const decks = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(deckSegs),
        ownLineMat(color, KIOSK_OPACITY.deck),
    )
    tagApp(decks, "deck", color, KIOSK_OPACITY.deck)
    group.add(decks)

    return {
        kind: "lift",
        id: lift.id,
        buildingId: b.id,
        storeyMin: lift.min_storey,
        storeyMax: lift.max_storey,
        object: group,
        appearance: [wire, decks],
        pickables: [],
        center: new THREE.Vector3(cx, bounds.bottom + bounds.height * 0.5, cz),
    }
}

function buildStairLines(profile: StairProfile): THREE.Vector3[] {
    const zFront = -STAIR_WIDTH * 0.5
    const zBack = STAIR_WIDTH * 0.5
    const points: THREE.Vector3[] = []
    for (let i = 0; i < profile.length - 1; i++) {
        const [x1, y1] = profile[i]
        const [x2, y2] = profile[i + 1]
        points.push(new THREE.Vector3(x1, y1, zFront), new THREE.Vector3(x2, y2, zFront))
        points.push(new THREE.Vector3(x1, y1, zBack), new THREE.Vector3(x2, y2, zBack))
    }
    for (let i = 1; i < profile.length; i += 2) {
        const [x, y] = profile[i]
        points.push(new THREE.Vector3(x, y, zFront), new THREE.Vector3(x, y, zBack))
    }
    return points
}

/** Stairs: switchback profile drawn as side rails + tread connectors. */
export function buildStairsNode(
    s: Stair,
    b: Building,
    storeys: StoreyResolver,
): KioskNode | null {
    if (s.max_storey - s.min_storey <= 0) return null
    const profile = buildStairProfile(b.id, storeys, s.min_storey, s.max_storey)
    if (profile.length < 2) return null

    const color = KIOSK_COLORS.stairs
    const group = new THREE.Group()
    group.position.set(b.x + s.x, 0, b.y + s.y)
    group.rotation.y = -((s.rotation ?? 0) * Math.PI) / 180

    const lines = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(buildStairLines(profile)),
        ownLineMat(color, KIOSK_OPACITY.line),
    )
    tagApp(lines, "line", color, KIOSK_OPACITY.line)
    group.add(lines)

    const bottom = storeys.bottomY(b.id, s.min_storey)
    const top = storeys.bottomY(b.id, s.max_storey)

    return {
        kind: "stairs",
        id: s.id,
        buildingId: b.id,
        storeyMin: s.min_storey,
        storeyMax: s.max_storey,
        object: group,
        appearance: [lines],
        pickables: [],
        center: new THREE.Vector3(b.x + s.x, (bottom + top) * 0.5, b.y + s.y),
    }
}
