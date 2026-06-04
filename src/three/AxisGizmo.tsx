import { useCallback, useEffect, useRef, type RefObject } from "react"
import * as THREE from "three"
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { AXES, type Axis } from "../types/three/axis-types"
import { projectAxes, snapCameraToAxis } from "./runtime/axisGizmoMath"

const SIZE = 110
const RADIUS = 36
const TIP_R = 13

type Props = {
    cameraRef: RefObject<THREE.PerspectiveCamera | null>
    controlsRef: RefObject<OrbitControls | null>
}

// Blender-style orientation gizmo. SVG overlay listening to OrbitControls
// "change" events — the projection math lives in axisGizmoMath.ts so this
// file only handles SVG mutation and React lifecycle.
export default function AxisGizmo({ cameraRef, controlsRef }: Props) {
    const tipRefs = useRef<Array<SVGGElement | null>>([])
    const lineRefs = useRef<Array<SVGLineElement | null>>([])

    const lockTo = useCallback((dir: Axis["dir"]) => {
        const camera = cameraRef.current
        const controls = controlsRef.current
        if (!camera || !controls) return
        snapCameraToAxis(camera, controls.target, dir)
        controls.update()
    }, [cameraRef, controlsRef])

    useEffect(() => {
        let raf = 0
        let attached = false
        let detach: (() => void) | null = null

        const update = (): void => {
            const camera = cameraRef.current
            const controls = controlsRef.current
            if (!camera || !controls) return

            const projected = projectAxes(camera, controls.target, RADIUS)

            for (const p of projected) {
                const g = tipRefs.current[p.index]
                if (!g) continue
                g.setAttribute(
                    "transform",
                    `translate(${SIZE / 2 + p.screenX}, ${SIZE / 2 + p.screenY})`,
                )
                g.setAttribute("opacity", (p.depth >= 0 ? 1 : 0.4).toFixed(2))
            }
            for (let i = 0; i < 3; i++) {
                const line = lineRefs.current[i]
                if (!line) continue
                const p = projected[i * 2]
                line.setAttribute("x2", String(SIZE / 2 + p.screenX))
                line.setAttribute("y2", String(SIZE / 2 + p.screenY))
                line.setAttribute("opacity", (p.depth >= 0 ? 0.85 : 0.3).toFixed(2))
            }
        }

        // Child effects run before parent's, so controlsRef.current is
        // still null right after mount. Poll via RAF until ready.
        const tryAttach = (): void => {
            const controls = controlsRef.current
            if (!attached && controls) {
                attached = true
                controls.addEventListener("change", update)
                controls.addEventListener("end", update)
                detach = () => {
                    controls.removeEventListener("change", update)
                    controls.removeEventListener("end", update)
                }
                update()
                return
            }
            raf = requestAnimationFrame(tryAttach)
        }
        tryAttach()

        return () => {
            if (raf) cancelAnimationFrame(raf)
            detach?.()
        }
    }, [cameraRef, controlsRef])

    return (
        <div
            className="absolute top-3 right-3 pointer-events-none select-none"
            style={{ width: SIZE, height: SIZE }}
            aria-hidden
        >
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                style={{ overflow: "visible" }}
            >
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={SIZE / 2 - 2}
                    fill="rgba(15, 23, 42, 0.55)"
                    stroke="rgba(255, 255, 255, 0.08)"
                />
                {[0, 1, 2].map((i) => {
                    const positive = AXES[i * 2]
                    return (
                        <line
                            key={`line-${i}`}
                            ref={(el) => { lineRefs.current[i] = el }}
                            x1={SIZE / 2}
                            y1={SIZE / 2}
                            x2={SIZE / 2}
                            y2={SIZE / 2}
                            stroke={positive.color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        />
                    )
                })}
                {AXES.map((axis, i) => (
                    <g
                        key={axis.label}
                        ref={(el) => { tipRefs.current[i] = el }}
                        onClick={() => lockTo(axis.dir)}
                        transform={`translate(${SIZE / 2}, ${SIZE / 2})`}
                        style={{ pointerEvents: "auto", cursor: "pointer" }}
                    >
                        <circle cx={0} cy={0} r={TIP_R + 4} fill="transparent" />
                        {axis.positive ? (
                            <>
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={TIP_R}
                                    fill={axis.color}
                                    stroke="rgba(0, 0, 0, 0.4)"
                                    strokeWidth={1}
                                />
                                <text
                                    x={0}
                                    y={1}
                                    fill="white"
                                    fontSize={13}
                                    fontWeight={700}
                                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    style={{ userSelect: "none" }}
                                >
                                    {axis.label}
                                </text>
                            </>
                        ) : (
                            <circle
                                cx={0}
                                cy={0}
                                r={TIP_R - 3}
                                fill="none"
                                stroke={axis.color}
                                strokeWidth={2}
                            />
                        )}
                    </g>
                ))}
            </svg>
        </div>
    )
}
