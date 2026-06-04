import type * as THREE from "three"
import type { FullGraph } from "../../types/FullGraph"
import { buildKioskCampus } from "./geometry/buildKioskCampus"
import { buildKioskPath } from "./pathOverlay"
import { disposeDeep } from "./materials"
import { applyAppearance } from "./appearance"
import type { KioskAppearance, KioskNode } from "./types"
import type { Vec3 } from "../../types/three/vector"

/** Owns the campus geometry for the kiosk. Geometry is rebuilt only when
 *  the graph identity changes; everything else (isolation, selection,
 *  highlight) is a cheap in-place appearance pass. */
export type KioskSceneController = {
    /** (Re)build geometry for a graph. No-op if the same graph instance. */
    setGraph: (graph: FullGraph | null) => void
    /** Apply visibility + colors for the current state. */
    apply: (state: KioskAppearance) => void
    /** Set (or clear) the A* route overlay. Cheap; rebuilds only the path. */
    setPath: (path: Vec3[] | null | undefined) => void
    getNodes: () => KioskNode[]
    getRoot: () => THREE.Group | null
    dispose: () => void
}

export function createKioskScene(scene: THREE.Scene): KioskSceneController {
    let root: THREE.Group | null = null
    let nodes: KioskNode[] = []
    let graphRef: FullGraph | null = null
    let pathGroup: THREE.Group | null = null
    let pathData: Vec3[] | null = null

    // The path overlay is a child of `root` so it inherits the campus
    // centering offset. It is rebuilt whenever the path or the root changes.
    const rebuildPath = (): void => {
        if (pathGroup) {
            pathGroup.parent?.remove(pathGroup)
            disposeDeep(pathGroup)
            pathGroup = null
        }
        if (root && pathData && pathData.length >= 2) {
            pathGroup = buildKioskPath(pathData)
            root.add(pathGroup)
        }
    }

    const clear = (): void => {
        if (root) {
            scene.remove(root)
            disposeDeep(root) // also disposes pathGroup (a child of root)
        }
        root = null
        nodes = []
        pathGroup = null
    }

    const setGraph = (graph: FullGraph | null): void => {
        if (graph === graphRef) return
        graphRef = graph
        clear()
        if (!graph) return
        const built = buildKioskCampus(graph)
        root = built.root
        nodes = built.nodes
        scene.add(root)
        rebuildPath() // re-attach any existing path to the fresh root
    }

    const setPath = (path: Vec3[] | null | undefined): void => {
        pathData = path ?? null
        rebuildPath()
    }

    const apply = (state: KioskAppearance): void => {
        applyAppearance(nodes, state)
    }

    return {
        setGraph,
        apply,
        setPath,
        getNodes: () => nodes,
        getRoot: () => root,
        dispose: clear,
    }
}
