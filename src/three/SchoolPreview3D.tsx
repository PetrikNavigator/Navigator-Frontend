import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import type { ResizePatch } from "../types/three/gizmo-types"
import type { Highlight } from "../types/three/build-scene-types"

import AxisGizmo from "./AxisGizmo"
import { buildAxes } from "./blueprint/axesBuilder"
import { createSceneController, type SceneController } from "./scene/sceneController"
import { attachGizmoInteraction } from "./gizmo/attachGizmoInteraction"
import { createCamera, createRenderer, createScene } from "./runtime/createRenderer"
import { createRenderLoop } from "./runtime/renderLoop"
import { observeContainerResize } from "./runtime/resizeObserver"
import type { FullGraph } from "../types/FullGraph"
import type { Vec3 } from "../types/three/vector"

type Props = {
    graph: FullGraph | null
    highlight?: Highlight
    path?: Vec3[]
    className?: string
    initialDistance?: number
    onResize?: (patch: ResizePatch) => void
    showAxes?: boolean
}

// React-owned lifecycle for the Three.js campus preview. All scene
// construction / gizmo logic lives in plain TS modules; this file
// only handles things that have to be React-managed: mounting the
// canvas, wiring refs, reacting to graph/highlight/path prop changes.
export default function SchoolPreview3D({
    graph,
    highlight,
    path,
    className = "w-full h-full",
    initialDistance,
    onResize,
    showAxes,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const controlsRef = useRef<OrbitControls | null>(null)
    const controllerRef = useRef<SceneController | null>(null)

    const requestRenderRef = useRef<(() => void) | null>(null)
    const onResizeRef = useRef(onResize)

    useEffect(() => { onResizeRef.current = onResize }, [onResize])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const renderer = createRenderer(container)
        const scene = createScene()
        const camera = createCamera(initialDistance ?? 80)
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.08

        const axes = showAxes ? buildAxes() : null
        axes?.objects.forEach((o) => scene.add(o))

        rendererRef.current = renderer
        sceneRef.current = scene
        cameraRef.current = camera
        controlsRef.current = controls

        const loop = createRenderLoop(renderer, scene, camera, controls)
        requestRenderRef.current = loop.requestRender

        controls.addEventListener("change", loop.requestRender)
        controls.addEventListener("start", loop.requestRender)

        const stopResize = observeContainerResize(
            container, renderer, camera, loop.requestRender,
        )

        const controller = createSceneController(scene)
        controllerRef.current = controller

        const detachGizmo = attachGizmoInteraction({
            canvas: renderer.domElement,
            camera,
            controls,
            getTarget: () => controller.getGizmoTarget(),
            getOnResize: () => onResizeRef.current,
            requestRender: loop.requestRender,
        })

        loop.requestRender()

        return () => {
            loop.stop()
            stopResize()
            controls.removeEventListener("change", loop.requestRender)
            controls.removeEventListener("start", loop.requestRender)
            detachGizmo()
            controls.dispose()
            axes?.dispose()

            controller.dispose()
            controllerRef.current = null

            renderer.dispose()
            renderer.forceContextLoss();
            container.removeChild(renderer.domElement)

            rendererRef.current = null
            sceneRef.current = null
            cameraRef.current = null
            controlsRef.current = null
            requestRenderRef.current = null
        }
    }, [initialDistance, showAxes])

    useEffect(() => {
        const controller = controllerRef.current
        if (!controller) return

        const localGraph: FullGraph = graph ?? { buildings: [], classroom_types: [], classrooms: [], corridors: [], lifts: [], stairs: [] }

        controller.apply({
            graph: localGraph,
            highlight: highlight ? highlight : null,
            path
        })

        requestRenderRef.current?.()
    }, [graph, highlight, path])

    return (
        <div className={className} style={{ position: "relative", overflow: "hidden", minHeight: 0, minWidth: 0 }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {showAxes && (
                <AxisGizmo cameraRef={cameraRef} controlsRef={controlsRef} />
            )}

            {!graph && !(highlight?.preview) && (
                <div className="absolute inset-0 grid place-items-center text-cyan-300 text-sm">
                    Nincs elérhető adat
                </div>
            )}
        </div>
    )
}
