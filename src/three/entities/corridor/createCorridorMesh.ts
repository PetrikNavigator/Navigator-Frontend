import * as THREE from "three"
import type { Corridor } from "../../../types/navigator/Corridor"
import type { CorridorHighlightUserData } from "../../../types/three/highlight-userdata-types"
import { COLORS } from "../../../types/three/color-types"
import type { RenderContext } from "../../../types/three/render-context-types"
import { makeLines } from "../../blueprint/primitives"
import { dimFactor, isHighlighted } from "../../scene/highlight"
import { storeyVisible } from "../../scene/visibility"
import {
    buildDirectionChevron,
    buildSideRails,
    buildTickMarks,
    computeCorridorEndpoints,
} from "./corridorGeometry"

function pickColor(cor: Corridor, highlighted: boolean): number {
    if (highlighted) return COLORS.highlight
    return cor.is_outdoor ? COLORS.yard : COLORS.corridor
}

function attachHighlightAnchor(
    wrapper: THREE.Group,
    cor: Corridor,
    widthM: number,
    p1: THREE.Vector2,
    p2: THREE.Vector2,
    y: number,
): void {
    const dir = p2.clone().sub(p1)
    const length = dir.length()
    const mid = p1.clone().lerp(p2, 0.5)
    const angle = Math.atan2(dir.y, dir.x)

    const anchor = new THREE.Group()
    anchor.position.set(mid.x, y, mid.y)
    anchor.rotation.y = -angle
    const data: CorridorHighlightUserData = {
        isHighlight: true,
        highlightKind: "corridor",
        x1: cor.x1, y1: cor.y1,
        x2: cor.x2, y2: cor.y2,
        width: widthM,
        length,
    }
    anchor.userData = data
    wrapper.add(anchor)
}

export function createCorridorMesh(cor: Corridor, ctx: RenderContext): THREE.Object3D {
    if (!storeyVisible(cor.storey, ctx.visibleStoreys)) return new THREE.Group()
    const b = ctx.buildingsById.get(cor.building_id)
    if (!b) return new THREE.Group()

    const widthM = cor.is_outdoor ? Math.max(cor.width, 4) : cor.width
    const endpoints = computeCorridorEndpoints(cor, b.x, b.y, widthM)
    if (!endpoints) return new THREE.Group()

    const highlighted = isHighlighted(ctx.highlight, "corridor", cor.id)
    const opacity = dimFactor(highlighted, ctx.highlight?.dimOthers || false)
    const color = pickColor(cor, highlighted)
    const y = ctx.storeys.bottomY(b.id, cor.storey) + 0.25

    const segs: THREE.Vector3[] = [
        ...buildSideRails(endpoints, y),
        ...buildTickMarks(endpoints, y),
        ...buildDirectionChevron(endpoints, y),
    ]
    const lines = makeLines(segs, color, opacity)

    if (!highlighted) return lines

    const wrapper = new THREE.Group()
    wrapper.add(lines)
    attachHighlightAnchor(wrapper, cor, widthM, endpoints.p1, endpoints.p2, y)
    return wrapper
}
