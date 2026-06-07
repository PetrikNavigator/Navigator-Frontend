import * as THREE from "three"
import type { FullGraph } from "../../types/FullGraph"
import type { StoreyResolver } from "../../types/three/storey-types"
import { FLOOR_HEIGHT } from "../../types/three/material-types"
import type {
    BuildingHighlightUserData,
    ClassroomHighlightUserData,
    CorridorHighlightUserData,
    LiftHighlightUserData,
    StairsHighlightUserData,
} from "../../types/three/highlight-userdata-types"
import { computeCorridorEndpoints } from "../entities/corridor/corridorGeometry"
import { computeShaftBounds } from "../entities/verticalAsset/verticalAssetCommon"
import type { MergedEntity } from "./merge"

/** An invisible, oriented `Object3D` carrying the per-kind `userData` the
 *  gizmo handle/drag layer reads. Decoupled from rendering: it only exists
 *  to host the handles for the entity currently being edited. Returns null
 *  when the entity can't be anchored (e.g. unknown building). The anchor's
 *  local frame matches what each `attachXHandles` function expects.
 *
 *  This is the `attachHighlightAnchor` logic that used to live inside the
 *  old per-entity mesh builders, lifted out so geometry comes from the
 *  kiosk layer instead. */
export function buildEditAnchor(
    merged: MergedEntity,
    graph: FullGraph,
    storeys: StoreyResolver,
): THREE.Object3D | null {
    switch (merged.kind) {
        case "building": {
            const b = merged.entity
            const anchor = new THREE.Group()
            anchor.position.set(b.x, 0, b.y)
            anchor.userData = {
                isHighlight: true,
                highlightKind: "building",
                x: b.x,
                y: b.y,
            } satisfies BuildingHighlightUserData
            return anchor
        }
        case "classroom": {
            const c = merged.entity
            const b = graph.buildings.find((x) => x.id === c.building_id)
            if (!b) return null
            const boxH = Math.min(c.size_z, FLOOR_HEIGHT)
            const storeyY = storeys.bottomY(b.id, c.storey)
            const anchor = new THREE.Group()
            anchor.position.set(b.x + c.x, storeyY + boxH * 0.5, b.y + c.y)
            anchor.rotation.y = -((c.rotation ?? 0) * Math.PI) / 180
            anchor.userData = {
                isHighlight: true,
                highlightKind: "classroom",
                size_x: c.size_x,
                size_y: c.size_y,
                size_z: c.size_z,
                boxH,
                x: c.x,
                y: c.y,
                rotation: c.rotation ?? 0,
            } satisfies ClassroomHighlightUserData
            return anchor
        }
        case "corridor": {
            const cor = merged.entity
            const b = graph.buildings.find((x) => x.id === cor.building_id)
            if (!b) return null
            const widthM = cor.is_outdoor ? Math.max(cor.width, 4) : cor.width
            const endpoints = computeCorridorEndpoints(cor, b.x, b.y, widthM)
            if (!endpoints) return null
            const y = storeys.bottomY(b.id, cor.storey) + 0.25
            const mid = endpoints.p1.clone().lerp(endpoints.p2, 0.5)
            const angle = Math.atan2(endpoints.dir.y, endpoints.dir.x)
            const anchor = new THREE.Group()
            anchor.position.set(mid.x, y, mid.y)
            anchor.rotation.y = -angle
            anchor.userData = {
                isHighlight: true,
                highlightKind: "corridor",
                x1: cor.x1, y1: cor.y1,
                x2: cor.x2, y2: cor.y2,
                width: widthM,
                length: endpoints.length,
            } satisfies CorridorHighlightUserData
            return anchor
        }
        case "lift": {
            const lift = merged.entity
            const b = graph.buildings.find((x) => x.id === lift.building_id)
            if (!b) return null
            const bounds = computeShaftBounds(b.id, storeys, lift.min_storey, lift.max_storey)
            const anchor = new THREE.Group()
            anchor.position.set(b.x + lift.x, 0, b.y + lift.y)
            anchor.userData = {
                isHighlight: true,
                highlightKind: "lift",
                x: lift.x, y: lift.y,
                min_storey: lift.min_storey,
                max_storey: lift.max_storey,
                bottom_y: bounds.bottom,
                top_y: bounds.top,
            } satisfies LiftHighlightUserData
            return anchor
        }
        case "stairs": {
            const s = merged.entity
            const b = graph.buildings.find((x) => x.id === s.building_id)
            if (!b) return null
            const bottom = storeys.bottomY(b.id, s.min_storey)
            const top = storeys.bottomY(b.id, s.max_storey)
            const anchor = new THREE.Group()
            anchor.position.set(b.x + s.x, 0, b.y + s.y)
            anchor.rotation.y = -((s.rotation ?? 0) * Math.PI) / 180
            anchor.userData = {
                isHighlight: true,
                highlightKind: "stairs",
                x: s.x, y: s.y,
                min_storey: s.min_storey,
                max_storey: s.max_storey,
                rotation: s.rotation ?? 0,
                bottom_y: bottom,
                top_y: top,
            } satisfies StairsHighlightUserData
            return anchor
        }
    }
}
