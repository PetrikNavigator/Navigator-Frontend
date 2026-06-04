import { useEffect, useRef } from "react"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import type { FullGraph } from "../types/FullGraph"
import { createCamera, createRenderer, createScene } from "./runtime/createRenderer"
import { createRenderLoop } from "./runtime/renderLoop"
import { observeContainerResize } from "./runtime/resizeObserver"
import { createKioskScene, type KioskSceneController } from "./kiosk/kioskScene"
import { createCameraRig, type CameraRig } from "./kiosk/cameraRig"
import { attachKioskInteraction } from "./kiosk/interaction"
import type {
    IsolatedFloor,
    KioskHighlight,
    KioskSelection,
} from "./kiosk/types"

type Props = {
    graph: FullGraph | null
    /** Which floor is isolated. `null`/undefined shows the whole campus. */
    isolatedFloor?: IsolatedFloor
    /** Start/end classroom selection (owned by the parent). */
    selection?: KioskSelection
    /** How to emphasize classrooms (by type, by id, …). */
    highlight?: KioskHighlight
    /** Tap on a floor plate. */
    onFloorClick?: (buildingId: string, storey: number) => void
    /** Tap on a classroom. */
    onClassroomClick?: (id: string) => void
    /** Hover over a classroom (null when leaving). */
    onClassroomHover?: (id: string | null) => void
    className?: string
    initialDistance?: number
}

function floorKeyOf(floor: IsolatedFloor): string {
    return floor ? `${floor.buildingId}:${floor.storey}` : ""
}

/**
 * Kiosk 3D view. Geometry, appearance, and interaction are fully
 * decoupled (see src/three/kiosk/*): geometry is built once per graph,
 * appearance is a cheap in-place pass on every state change, and picking
 * never rebuilds anything. This component only owns the React/Three
 * lifecycle and bridges props/callbacks to those layers.
 */
export default function KioskView3D({
    graph,
    isolatedFloor,
    selection,
    highlight,
    onFloorClick,
    onClassroomClick,
    onClassroomHover,
    className = "w-full h-full",
    initialDistance = 120,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    const controllerRef = useRef<KioskSceneController | null>(null)
    const rigRef = useRef<CameraRig | null>(null)
    const requestRenderRef = useRef<(() => void) | null>(null)

    // Latest callbacks/props read by the (long-lived) interaction handlers.
    const onFloorClickRef = useRef(onFloorClick)
    const onClassroomClickRef = useRef(onClassroomClick)
    const onClassroomHoverRef = useRef(onClassroomHover)
    useEffect(() => { onFloorClickRef.current = onFloorClick }, [onFloorClick])
    useEffect(() => { onClassroomClickRef.current = onClassroomClick }, [onClassroomClick])
    useEffect(() => { onClassroomHoverRef.current = onClassroomHover }, [onClassroomHover])

    // Change-tracking across renders so we only reframe when needed.
    const graphRef = useRef<FullGraph | null | undefined>(undefined)
    const floorKeyRef = useRef<string | null>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const renderer = createRenderer(container)
        const scene = createScene()
        const camera = createCamera(initialDistance)
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.08
        // Constrained-but-free: keep the camera above ground, allow orbit/zoom/pan.
        controls.maxPolarAngle = Math.PI * 0.495
        controls.minDistance = 5
        controls.maxDistance = 2000

        const loop = createRenderLoop(renderer, scene, camera, controls)
        requestRenderRef.current = loop.requestRender
        controls.addEventListener("change", loop.requestRender)
        controls.addEventListener("start", loop.requestRender)

        const stopResize = observeContainerResize(container, renderer, camera, loop.requestRender)

        const controller = createKioskScene(scene)
        controllerRef.current = controller

        const rig = createCameraRig(
            camera,
            controls,
            () => controller.getRoot(),
            () => controller.getNodes(),
            loop.requestRender,
        )
        rigRef.current = rig

        const detachInteraction = attachKioskInteraction({
            canvas: renderer.domElement,
            camera,
            getNodes: () => controller.getNodes(),
            onPick: (pick) => {
                if (pick.kind === "floor") onFloorClickRef.current?.(pick.buildingId, pick.storey)
                else onClassroomClickRef.current?.(pick.id)
            },
            onHover: (pick) => {
                onClassroomHoverRef.current?.(pick?.kind === "classroom" ? pick.id : null)
            },
            requestRender: loop.requestRender,
        })

        // Force a fresh sync on (re)mount.
        graphRef.current = undefined
        floorKeyRef.current = null
        loop.requestRender()

        return () => {
            loop.stop()
            stopResize()
            detachInteraction()
            controls.removeEventListener("change", loop.requestRender)
            controls.removeEventListener("start", loop.requestRender)
            controls.dispose()
            controller.dispose()
            controllerRef.current = null
            rigRef.current = null
            requestRenderRef.current = null
            renderer.dispose()
            renderer.forceContextLoss()
            container.removeChild(renderer.domElement)
        }
    }, [initialDistance])

    // Sync graph + appearance + framing on any relevant prop change.
    useEffect(() => {
        const controller = controllerRef.current
        const rig = rigRef.current
        if (!controller) return

        const graphChanged = graphRef.current !== graph
        controller.setGraph(graph)
        graphRef.current = graph

        controller.apply({
            isolatedFloor: isolatedFloor ?? null,
            selection,
            highlight,
        })

        const floorKey = floorKeyOf(isolatedFloor ?? null)
        const floorChanged = floorKeyRef.current !== floorKey
        floorKeyRef.current = floorKey

        // Reframe when the graph (re)loads or the isolated floor changes.
        if (graphChanged || floorChanged) rig?.frameFloor(isolatedFloor ?? null)

        requestRenderRef.current?.()
    }, [graph, isolatedFloor, selection, highlight])

    return (
        <div
            className={className}
            style={{ position: "relative", overflow: "hidden", minHeight: 0, minWidth: 0 }}
        >
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {!graph && (
                <div className="absolute inset-0 grid place-items-center text-cyan-300 text-sm">
                    Nincs elérhető adat
                </div>
            )}
        </div>
    )
}

export type { IsolatedFloor, KioskSelection, KioskHighlight }
