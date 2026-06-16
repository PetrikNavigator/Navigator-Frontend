import { useCallback, useEffect, useMemo, useState } from "react"
import { useGraph } from "../contexts/other/GraphContext"
import { useTheme } from "../contexts/other/ThemeContext"
import KioskView3D from "../three/KioskView3D"
import type { Classroom } from "../types/navigator/Classroom"
import type { IsolatedFloor, KioskNode } from "../three/kiosk/types"
import type { Vec3 } from "../types/three/vector"
import { GraphPathBuilder } from "../three/path/pathbuilder"
import { loadMyLocation, type MyLocation } from "../types/navigator/MyLocation"
import {
    searchClassrooms,
    storeyLabel,
} from "../utils/classroomSearch"
import { useIdleTimer } from "../hooks/useIdleTimer"
import KioskNavbar from "../components/kiosk/KioskNavbar"
import SearchPanel from "../components/kiosk/SearchPanel"
import TypeHighlighter from "../components/kiosk/TypeHighlighter"

/** Canvas background per theme. Dark mirrors the original kiosk palette;
 *  light is a soft slate that keeps the cyan geometry readable. */
const CANVAS_BG_DARK = 0x070d18
const CANVAS_BG_LIGHT = 0xe7f7f5

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
    const { theme, } = useTheme()

    const [view, setView] = useState<View>("search")
    const [startQuery, setStartQuery] = useState("")

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
        setStartQuery("")
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

    // ---- Navigation start/target & pathfinding -----------------------------
    const goToNavigate = useCallback(() => {
        if (!targetId) return
        setView("navigate")
        setStartId(null) // default to saved location (if any)
        setStartQuery("")
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

    const startResults = useMemo(
        () => (view === "navigate" ? searchClassrooms(graph, startQuery).slice(0, 30) : []),
        [graph, startQuery, view],
    )

    const startLabel = startId ? nameOf(startId) : myLocation ? "Saját pozíció" : "-"

    if (!graph)
        return

    return (
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
                            className="w-full h-full"
                        />

                        {hoveredId && (
                            <div className="absolute bottom-2 left-2 badge badge-neutral">
                                {nameOf(hoveredId)}
                            </div>
                        )}

                        <div className="absolute bottom-2 right-2">
                            <button className="btn btn-xs btn-outline" onClick={resetAll}>Visszaállítás</button>
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
                                targetName={classroomById.get(targetId!)?.name ?? nameOf(targetId)}
                                startLabel={startLabel}
                                startQuery={startQuery}
                                setStartQuery={setStartQuery}
                                startResults={startResults}
                                onPickStart={(id) => { setStartId(id); setStartQuery("") }}
                                onResetStartToLocation={myLocation ? () => setStartId(null) : undefined}
                                hasSavedLocation={!!myLocation}
                                barrierFree={barrierFree}
                                setBarrierFree={setBarrierFree}
                                needsStart={needsStart}
                                noRoute={noRoute}
                                onBack={backToSearch}
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
    )
}

/* ---------------------------- Navigate view ------------------------------ */

type NavigatePanelProps = {
    targetName: string
    startLabel: string
    startQuery: string
    setStartQuery: (v: string) => void
    startResults: Classroom[]
    onPickStart: (id: string) => void
    onResetStartToLocation?: () => void
    hasSavedLocation: boolean
    barrierFree: boolean
    setBarrierFree: (v: boolean) => void
    needsStart: boolean
    noRoute: boolean
    onBack: () => void
}

function NavigatePanel({
    targetName, startLabel, startQuery, setStartQuery, startResults, onPickStart,
    onResetStartToLocation, hasSavedLocation, barrierFree, setBarrierFree,
    needsStart, noRoute, onBack,
}: NavigatePanelProps) {
    return (
        <div className="card bg-base-200 p-3 gap-3">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Útvonal</h2>
                <button className="btn btn-ghost btn-xs" onClick={onBack}>← Vissza</button>
            </div>

            <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: "#55ddff" }} />
                    <span>Kiindulás: <b>{startLabel}</b></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: "#ff5577" }} />
                    <span>Cél: <b>{targetName}</b></span>
                </div>
            </div>

            {/* Choose / change the start point. */}
            <div className="flex flex-col gap-2">
                <label className="input input-bordered input-sm flex items-center gap-2">
                    <span className="opacity-60">🔍</span>
                    <input
                        type="text"
                        className="grow"
                        placeholder="Kiindulási terem keresése…"
                        value={startQuery}
                        onChange={(e) => setStartQuery(e.target.value)}
                    />
                </label>
                {startQuery && (
                    <ul className="menu menu-sm bg-base-100 rounded-box max-h-44 overflow-y-auto flex-nowrap p-1">
                        {startResults.length === 0 && (
                            <li className="px-2 py-2 text-xs opacity-60">Nincs találat.</li>
                        )}
                        {startResults.map((c) => (
                            <li key={c.id}>
                                <button onClick={() => onPickStart(c.id)}>
                                    <span>{c.name}</span>
                                    <span className="text-xs opacity-60 ml-auto">
                                        {storeyLabel(c.storey)}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {hasSavedLocation && onResetStartToLocation && (
                    <button className="btn btn-xs btn-outline w-fit" onClick={onResetStartToLocation}>
                        Saját pozícióra állít
                    </button>
                )}
                <p className="text-xs opacity-60">
                    Keress rá a kiindulási teremre, vagy koppints egy teremre a 3D nézetben.
                </p>
            </div>

            <label className="label cursor-pointer justify-start gap-2">
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={barrierFree}
                    onChange={(e) => setBarrierFree(e.target.checked)}
                />
                <span className="text-sm">Akadálymentes (liftek)</span>
            </label>

            {needsStart && (
                <div className="alert alert-info py-2 text-xs">
                    <span>Válassz kiindulási pontot az útvonalhoz.</span>
                </div>
            )}
            {noRoute && (
                <div className="alert alert-warning py-2 text-xs">
                    <span>Nem található útvonal a két pont között.</span>
                </div>
            )}
        </div>
    )
}
