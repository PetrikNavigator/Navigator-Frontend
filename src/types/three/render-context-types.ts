import type { Building } from "../navigator/Building"
import type { FullGraph } from "../FullGraph"
import type { Highlight } from "./build-scene-types"
import type { StoreyResolver } from "./storey-types"

/** Shared per-render state passed to every entity builder.
 *  Mirrors what the Godot app passes (graph + selectedStorey-like context). */
export type RenderContext = {
    graph: FullGraph
    buildingsById: Map<string, Building>
    storeys: StoreyResolver
    highlight: Highlight
    visibleStoreys: { min: number; max: number } | null
}

export type StoreyRange = { min: number; max: number }
