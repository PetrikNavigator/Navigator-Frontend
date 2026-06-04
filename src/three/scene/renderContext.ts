import type { Building } from "../../types/navigator/Building"
import type { FullGraph } from "../../types/FullGraph"
import type { Highlight } from "../../types/three/build-scene-types"
import type { RenderContext } from "../../types/three/render-context-types"
import { buildStoreyResolver } from "./storeyResolver"
import { computeVisibleStoreys } from "./visibility"

// Assemble the per-render context object. The same object is passed
// to every entity builder so they share storey heights, the buildings
// map, and the highlight/dim configuration without re-deriving them.
export function buildRenderContext(
    graph: FullGraph,
    highlight: Highlight
): RenderContext {
    const buildingsById = new Map<string, Building>(graph.buildings.map((b) => [b.id, b]))
    const storeys = buildStoreyResolver(graph.classrooms)
    const visibleStoreys = computeVisibleStoreys(highlight)
    return { graph, buildingsById, storeys, highlight, visibleStoreys }
}
