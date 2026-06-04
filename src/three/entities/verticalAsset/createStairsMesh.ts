import * as THREE from "three"
import type { Stair } from "../../../types/navigator/Stair"
import type { StairsHighlightUserData } from "../../../types/three/highlight-userdata-types"
import { COLORS } from "../../../types/three/color-types"
import type { RenderContext } from "../../../types/three/render-context-types"
import { makeLines } from "../../blueprint/primitives"
import { dimFactor, isHighlighted } from "../../scene/highlight"
import { rangeVisible } from "../../scene/visibility"
import { buildStairProfile, type StairProfile } from "./stairProfile"

const STAIR_WIDTH = 2.5

function buildStairLines(profile: StairProfile): THREE.Vector3[] {
    const zFront = -STAIR_WIDTH * 0.5
    const zBack = STAIR_WIDTH * 0.5
    const points: THREE.Vector3[] = []
    // Side rails: profile drawn at front and back z.
    for (let i = 0; i < profile.length - 1; i++) {
        const [x1, y1] = profile[i]
        const [x2, y2] = profile[i + 1]
        points.push(new THREE.Vector3(x1, y1, zFront), new THREE.Vector3(x2, y2, zFront))
        points.push(new THREE.Vector3(x1, y1, zBack),  new THREE.Vector3(x2, y2, zBack))
    }
    // Tread connectors at every step's top corner (odd indices).
    for (let i = 1; i < profile.length; i += 2) {
        const [x, y] = profile[i]
        points.push(new THREE.Vector3(x, y, zFront), new THREE.Vector3(x, y, zBack))
    }
    return points
}

function attachHighlightAnchor(group: THREE.Group, s: Stair, bottom: number, top: number): void {
    const anchor = new THREE.Group()
    const data: StairsHighlightUserData = {
        isHighlight: true,
        highlightKind: "stairs",
        x: s.x, y: s.y,
        min_storey: s.min_storey,
        max_storey: s.max_storey,
        rotation: s.rotation ?? 0,
        bottom_y: bottom,
        top_y: top,
    }
    anchor.userData = data
    group.add(anchor)
}

export function createStairsMesh(s: Stair, ctx: RenderContext): THREE.Object3D {
    if (!rangeVisible(s.min_storey, s.max_storey, ctx.visibleStoreys)) return new THREE.Group()
    const b = ctx.buildingsById.get(s.building_id)
    if (!b) return new THREE.Group()

    const highlighted = isHighlighted(ctx.highlight, "stairs", s.id)
    const opacity = dimFactor(highlighted, ctx.highlight?.dimOthers || false)
    const color = highlighted ? COLORS.highlight : COLORS.stairs

    const group = new THREE.Group()
    group.position.set(b.x + s.x, 0, b.y + s.y)
    group.rotation.y = -((s.rotation ?? 0) * Math.PI) / 180

    if (s.max_storey - s.min_storey <= 0) return group

    const profile = buildStairProfile(b.id, ctx.storeys, s.min_storey, s.max_storey)
    if (profile.length < 2) return group

    const lines = makeLines(buildStairLines(profile), color, opacity)
    group.add(lines)

    if (highlighted) {
        const bottom = ctx.storeys.bottomY(b.id, s.min_storey)
        const top = ctx.storeys.bottomY(b.id, s.max_storey)
        attachHighlightAnchor(group, s, bottom, top)
    }
    return group
}
