import * as THREE from "three"
import type { Lift } from "../../../types/navigator/Lift"
import type { LiftHighlightUserData } from "../../../types/three/highlight-userdata-types"
import { COLORS } from "../../../types/three/color-types"
import type { RenderContext } from "../../../types/three/render-context-types"
import { wireBox } from "../../blueprint/primitives"
import { dimFactor, isHighlighted } from "../../scene/highlight"
import { rangeVisible } from "../../scene/visibility"
import { buildDeckMarkers } from "./deckMarkers"
import { computeShaftBounds } from "./verticalAssetCommon"

const FOOTPRINT = 1.0

function attachHighlightAnchor(group: THREE.Group, lift: Lift, b: { x: number; y: number }, bounds: { bottom: number; top: number }): void {
    const anchor = new THREE.Group()
    anchor.position.set(b.x + lift.x, 0, b.y + lift.y)
    const data: LiftHighlightUserData = {
        isHighlight: true,
        highlightKind: "lift",
        x: lift.x, y: lift.y,
        min_storey: lift.min_storey,
        max_storey: lift.max_storey,
        bottom_y: bounds.bottom,
        top_y: bounds.top,
    }
    anchor.userData = data
    group.add(anchor)
}

export function createLiftMesh(lift: Lift, ctx: RenderContext): THREE.Object3D {
    if (!rangeVisible(lift.min_storey, lift.max_storey, ctx.visibleStoreys)) return new THREE.Group()
    const b = ctx.buildingsById.get(lift.building_id)
    if (!b) return new THREE.Group()

    const highlighted = isHighlighted(ctx.highlight, "lift", lift.id)
    const opacity = dimFactor(highlighted, ctx.highlight?.dimOthers || false)
    const color = highlighted ? COLORS.highlight : COLORS.lift
    const bounds = computeShaftBounds(b.id, ctx.storeys, lift.min_storey, lift.max_storey)
    if (bounds.height <= 0) return new THREE.Group()

    const group = new THREE.Group()
    const wire = wireBox(FOOTPRINT, bounds.height, FOOTPRINT, color, opacity)
    wire.position.set(b.x + lift.x, bounds.bottom + bounds.height * 0.5, b.y + lift.y)
    group.add(wire)

    group.add(buildDeckMarkers({
        buildingId: b.id,
        storeys: ctx.storeys,
        cx: b.x + lift.x,
        cz: b.y + lift.y,
        minStorey: lift.min_storey,
        maxStorey: lift.max_storey,
        footprint: FOOTPRINT,
        color,
        opacity,
    }))

    if (highlighted) attachHighlightAnchor(group, lift, b, bounds)
    return group
}
