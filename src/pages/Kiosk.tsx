import { useCallback, useEffect, useMemo, useState } from "react"
import { useGraph } from "../contexts/other/GraphContext"
import { useTheme } from "../contexts/other/ThemeContext"
import KioskView3D from "../three/KioskView3D"
import type { Classroom } from "../types/navigator/Classroom"
import type { IsolatedFloor, KioskNode } from "../three/kiosk/types"
import type { Vec3 } from "../types/three/vector"
import { GraphPathBuilder } from "../three/path/pathbuilder"
import { loadMyLocation, type MyLocation } from "../types/navigator/MyLocation"
import { useIdleTimer } from "../hooks/useIdleTimer"
import KioskNavbar from "../components/kiosk/KioskNavbar"
import SearchPanel from "../components/kiosk/SearchPanel"
import TypeHighlighter from "../components/kiosk/TypeHighlighter"
import NavigatePanel from "../components/kiosk/NavigatePanel"
import { VirtualKeyboardProvider } from "../contexts/other/VirtualKeyboardContext"

/** Canvas background per theme. Dark mirrors the original kiosk palette;
 *  light is a soft slate that keeps the cyan geometry readable. */
const CANVAS_BG_DARK = 0x070d18
const CANVAS_BG_LIGHT = 0xE8FBED

/** Reset the kiosk after this long with no user input. */
const IDLE_MS = 60_000

type View = "search" | "navigate"

/**
 * Kiosk UI. Two modes share one live 3D canvas:
 *  - "search": find a classroom by name/description, see its info + location.
 *  - "navigate": route to that classroom from a chosen start (or the saved
 *    "you are here" position from /beallitasok).
 *
 * All interaction state lives here; KioskView3D is fully controlled. After
 * 60s of inactivity everything resets to the default search view without a
 * page reload.
 */
export default function Kiosk() {
    const { graph, getFullGraph, isLoading, isError, error } = useGraph()
    const { theme } = useTheme()

    const [view, setView] = useState<View>("search")

    // The classroom chosen in search → becomes the navigation target.
    const [targetId, setTargetId] = useState<string | null>(null)
    // Explicit navigation start. null + a saved location ⇒ route from there.
    const [startId, setStartId] = useState<string | null>(null)

    const [isolatedFloor, setIsolatedFloor] = useState<IsolatedFloor>(null)
    const [highlightTypeIds, setHighlightTypeIds] = useState<string[]>([])
    const [barrierFree, setBarrierFree] = useState(false)
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [myLocation, setMyLocation] = useState<MyLocation | null>(null)

    // Bumped to force the 3D camera back to the default campus framing.
    const [viewResetToken, setViewResetToken] = useState(0)

    useEffect(() => {
        getFullGraph()
        setMyLocation(loadMyLocation())
    }, [])

    const classroomById = useMemo(() => {
        const m = new Map<string, Classroom>()
        graph?.classrooms.forEach((c) => m.set(c.id, c))
        return m
    }, [graph])

    const nameOf = useCallback(
        (id?: string | null): string =>
            id ? classroomById.get(id)?.name ?? id : "—",
        [classroomById],
    )

    const resetAll = useCallback(() => {
        setView("search")
        setTargetId(null)
        setStartId(null)
        setIsolatedFloor(null)
        setHighlightTypeIds([])
        setBarrierFree(false)
        setHoveredId(null)
        setViewResetToken((n) => n + 1)
    }, [])

    useIdleTimer(resetAll, IDLE_MS)

    const selectTarget = (id: string) => {
        setTargetId(id)
        const c = classroomById.get(id)
        if (c) setIsolatedFloor({ buildingId: c.building_id, storey: c.storey })
    }

    const onObjectClick = (x: KioskNode) => {
        if (x.kind !== "classroom")
            return;

        if (view === "navigate") {
            if (startId !== x.id)
                setStartId(x.id)
        } else {
            selectTarget(x.id)
        }
    }

    const onObjectHover = (x: KioskNode | null) => {
        if (!x) {
            setHoveredId(null)
            return
        }

        if (x.kind !== "classroom")
            return

        setHoveredId(x.id)
    }

    // ---- Navigation start/target & pathfinding -----------------------------
    const goToNavigate = useCallback(() => {
        if (!targetId) return
        setView("navigate")
        setStartId(null) // default to saved location (if any)
        setIsolatedFloor(null) // show the whole campus so the route is visible
    }, [targetId])

    const backToSearch = useCallback(() => {
        setView("search")
        const c = targetId ? classroomById.get(targetId) : null
        if (c) setIsolatedFloor({ buildingId: c.building_id, storey: c.storey })
    }, [targetId, classroomById])

    const pathBuilder = useMemo(() => {
        if (!graph) return null
        return new GraphPathBuilder(graph, barrierFree, myLocation)
    }, [graph, barrierFree, myLocation])

    const path = useMemo<Vec3[]>(() => {
        if (!pathBuilder || view !== "navigate" || !targetId) return []
        // Explicit start wins; otherwise route from the saved location.
        if (startId) {
            const res = pathBuilder.getPath(startId, targetId, barrierFree)
            return res.length >= 2 ? res : []
        }
        if (myLocation) {
            const res = pathBuilder.getPathFromLocation(targetId, barrierFree)
            return res.length >= 2 ? res : []
        }
        return []
    }, [pathBuilder, view, targetId, startId, myLocation, barrierFree])

    const hasStart = !!startId || (view === "navigate" && !!myLocation)
    const noRoute = view === "navigate" && !!targetId && hasStart && path.length < 2
    const needsStart = view === "navigate" && !!targetId && !hasStart

    // ---- Props passed to the 3D view ---------------------------------------
    const selection = useMemo(() => {
        if (view === "navigate") return { start: startId, end: targetId }
        // Search mode: highlight the located room as the "start" marker.
        return { start: targetId, end: null }
    }, [view, startId, targetId])

    const highlight = useMemo(
        () => ({
            typeIds: highlightTypeIds,
            dimOthers: highlightTypeIds.length > 0,
        }),
        [highlightTypeIds],
    )

    const background = theme ? CANVAS_BG_DARK : CANVAS_BG_LIGHT

    if (!graph)
        return

    return (
        <VirtualKeyboardProvider>
        <div className="h-screen flex flex-col">
            <KioskNavbar />

            <main className="flex-1 min-h-0 p-4">
                <div className="flex flex-col xl:flex-row gap-4 h-full">
                    <div className="relative flex-1 min-h-[50%] rounded-xl overflow-hidden border border-base-300">
                        <KioskView3D
                            graph={graph}
                            isolatedFloor={isolatedFloor}
                            selection={selection}
                            highlight={highlight}
                            path={path}
                            myLocation={myLocation}
                            background={background}
                            viewResetToken={viewResetToken}
                            onObjectClick={onObjectClick}
                            onObjectHover={onObjectHover}
                            className="w-full h-full"
                        />

                        {hoveredId && (
                            <div className="absolute bottom-2 left-2 badge md:badge-xl bg-base-content text-base-100">
                                {nameOf(hoveredId)}
                            </div>
                        )}

                        <div className="absolute bottom-2 right-2">
                            <button className="btn btn-xs md:btn-md btn-outline" onClick={resetAll}>Visszaállítás</button>
                        </div>
                    </div>

                    {/* Control panel. */}
                    <div className="flex flex-col gap-3 min-h-0 xl:w-96 xl:h-full xl:overflow-y-auto">
                        {isLoading && (
                            <div className="alert alert-info py-2"><span>Adatok betöltése…</span></div>
                        )}
                        {isError && (
                            <div className="alert alert-error py-2"><span>Hiba: {error ?? "ismeretlen"}</span></div>
                        )}

                        {view === "search" ? (
                            <SearchPanel
                                onNavigate={goToNavigate}
                                onSelect={selectTarget}
                                selectedId={targetId}
                                resetToken={viewResetToken}
                            />

                        ) : (
                            <NavigatePanel
                                onSelectEnd={setTargetId}
                                onSelectStart={setStartId}
                                onBack={backToSearch}
                                startId={startId}
                                endId={targetId!}
                                barrierFree={barrierFree}
                                setBarrierFree={setBarrierFree}
                                hasPos={!!myLocation}
                                needsStart={needsStart}
                                noRoute={noRoute}
                            />
                        )}

                        <TypeHighlighter
                            selectedIds={highlightTypeIds}
                            setSelectedIds={setHighlightTypeIds}
                            types={graph?.classroom_types ?? []}
                        />
                    </div>
                </div>
            </main>
        </div>
        </VirtualKeyboardProvider>
    )
}