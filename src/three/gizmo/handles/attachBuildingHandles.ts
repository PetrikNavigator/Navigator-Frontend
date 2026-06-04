import type * as THREE from "three"
import type { TranslateXYHandleSpec } from "../../../types/three/gizmo-types"
import { makeTranslatePad } from "./makeTranslatePad"

const BUILDING_TRANSLATE_SPEC: TranslateXYHandleSpec = {
    kind: "translate-xy",
    xKey: "x",
    yKey: "y",
    patchXKey: "x",
    patchYKey: "y",
}

// Buildings have no intrinsic mesh: just a single cyan disc anchored at
// the building's position. Drag emits { x, y } in the data model space.
export function attachBuildingHandles(target: THREE.Object3D): void {
    const { pad, arrows } = makeTranslatePad(BUILDING_TRANSLATE_SPEC, 3.5, 0.18)
    pad.position.set(0, 0.1, 0)
    arrows.position.copy(pad.position)
    target.add(pad)
    target.add(arrows)
}
