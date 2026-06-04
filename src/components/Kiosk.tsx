import { useEffect, useMemo, useState } from "react"
import { useGraph } from "../contexts/other/GraphContext"
import KioskView3D from "../three/KioskView3D"
import type { Classroom } from "../types/navigator/Classroom"
import type { IsolatedFloor, KioskSelection } from "../three/kiosk/types"
import { useSearchParams } from "react-router"
import type { Vec3 } from "../types/three/vector"
import { GraphPathBuilder } from "../three/path/pathbuilder"

/**
 * Demo host for the kiosk 3D view. Owns all interaction state:
 *  - which floor is isolated (set by tapping a floor in 3D),
 *  - the start/end classroom selection (parent runs the cycle),
 *  - which classroom types are highlighted.
 * The 3D component is fully controlled by these props.
 */
export default function Kiosk() {
    const [searchParams, setSearchParams] = useSearchParams();

    const { graph, getFullGraph, isLoading, isError, error } = useGraph()

    const [isolatedFloor, setIsolatedFloor] = useState<IsolatedFloor>(null)
    const [selection, setSelection] = useState<KioskSelection | null>(null)
    const [highlightTypeIds, setHighlightTypeIds] = useState<string[]>([])
    const [dimOthers, setDimOthers] = useState(false)
    const [barrierFree, setBarrierFree] = useState(false)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    useEffect(() => {
        getFullGraph()
    }, [])

    useEffect(() => {
        const start = searchParams.get("start")
        const end = searchParams.get("end")
        const barrierFree = searchParams.get("akadalymentes")

        if (barrierFree)
            setBarrierFree(barrierFree == "1")

        setSelection({ start, end })
    }, [searchParams])

    // The selection cycle lives here, not in the 3D component: 1st tap =
    // start, 2nd = end, 3rd = start again. Tapping the current start again
    // clears it.
    const handleClassroomClick = (id: string): void => {
        let newStart: string | null = null;
        let newEnd: string | null = null;

        if (!selection) {
            newStart = id;
        } else {
            if (!selection.start || selection.end) {
                newStart = id;
            } else {
                newStart = selection.start;
                newEnd = id;
            }
        }

        setSearchParams((prev) => {
            if (newStart) {
                prev.set("start", newStart);
            } else {
                prev.delete("start");
            }

            if (newEnd) {
                prev.set("end", newEnd);
            } else {
                prev.delete("end");
            }

            return prev;
        });
    };

    const handleFloorClick = (buildingId: string, storey: number): void => {
        setIsolatedFloor({ buildingId, storey })
    }

    const handleRemove = () => {
        setSearchParams((prev) => {
            prev.delete("start")
            prev.delete("end")

            return prev;
        })
    }

    const classroomById = useMemo(() => {
        const m = new Map<string, Classroom>()
        graph?.classrooms.forEach((c) => m.set(c.id, c))
        return m
    }, [graph])

    const buildingNameById = useMemo(() => {
        const m = new Map<string, string>()
        graph?.buildings.forEach((b) => m.set(b.id, b.name))
        return m
    }, [graph])

    const highlight = useMemo(
        () => ({ typeIds: highlightTypeIds, dimOthers }),
        [highlightTypeIds, dimOthers],
    )

    // Route between the selected start/end. Recomputed only when those
    // (or the graph / barrier-free flag) change.
    const path = useMemo<Vec3[]>(() => {
        if (!graph || !selection?.start || !selection?.end) return []
        const builder = new GraphPathBuilder(graph, barrierFree)
        const res = builder.getPath(selection.start, selection.end)

        return res.length >= 2 ? res : []
    }, [graph, selection, barrierFree])

    const noRoute = !!selection?.start && !!selection?.end && path.length < 2

    const nameOf = (id?: string | null): string =>
        id ? classroomById.get(id)?.name ?? id : "—"

    const toggleType = (id: string): void =>
        setHighlightTypeIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )

    const floorLabel = isolatedFloor
        ? `${buildingNameById.get(isolatedFloor.buildingId) ?? "?"} — ${isolatedFloor.storey}. emelet`
        : null

    return (
        <div className="xl:flex xl:space-x-6 h-full w-full">
            <div className="overflow-x-auto xl:flex-shrink-0 xl:w-80 space-y-4">
                <h1 className="text-2xl font-bold text-primary">Kioszk</h1>

                {isLoading && (
                    <div className="alert alert-info">
                        <span>Adatok betöltése…</span>
                    </div>
                )}
                {isError && (
                    <div className="alert alert-error">
                        <span>Hiba: {error ?? "ismeretlen"}</span>
                    </div>
                )}

                {/* Floor isolation */}
                <div className="card bg-base-200 p-3">
                    <h2 className="font-semibold mb-1">Emelet</h2>
                    {floorLabel ? (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">{floorLabel}</span>
                            <button
                                className="btn btn-xs btn-outline"
                                onClick={() => setIsolatedFloor(null)}
                            >
                                Összes
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm opacity-70">
                            Kattints egy szintre a 3D nézetben a kiválasztáshoz.
                        </p>
                    )}
                </div>

                {/* Start / end selection */}
                <div className="card bg-base-200 p-3">
                    <h2 className="font-semibold mb-2">Kiválasztás</h2>
                    <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ background: "#55ddff" }} />
                            <span>Kiindulás: <b>{nameOf(selection?.start)}</b></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ background: "#ff5577" }} />
                            <span>Cél: <b>{nameOf(selection?.end)}</b></span>
                        </div>
                    </div>
                    <button
                        className="btn btn-xs btn-outline mt-2 w-fit"
                        onClick={handleRemove}
                        disabled={!selection?.start && !selection?.end}
                    >
                        Törlés
                    </button>
                    <label className="label cursor-pointer justify-start gap-2 mt-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={barrierFree}
                            onChange={(e) => {
                                setSearchParams((prev) => {
                                    prev.set("akadalymentes", e.target.checked ? "1" : "0")
                                    return prev;
                                })
                            }}
                        />
                        <span className="text-sm">Akadálymentes (liftek)</span>
                    </label>
                    {noRoute && (
                        <div className="alert alert-warning mt-2 py-2 text-xs">
                            <span>Nem található útvonal a két pont között.</span>
                        </div>
                    )}
                    <p className="text-xs opacity-60 mt-2">
                        Kattints a termekre: 1. = kiindulás, 2. = cél, 3. = új kiindulás.
                    </p>
                </div>

                {/* Type highlight */}
                <div className="card bg-base-200 p-3">
                    <h2 className="font-semibold mb-2">Terem kiemelés (típus)</h2>
                    <div className="flex flex-wrap gap-2">
                        {graph?.classroom_types.map((t) => {
                            const active = highlightTypeIds.includes(t.id)
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => toggleType(t.id)}
                                    className={`btn btn-xs ${active ? "btn-primary" : "btn-outline"}`}
                                >
                                    <span
                                        className="h-2 w-2 rounded-full mr-1"
                                        style={{ background: t.colorhex || "#888" }}
                                    />
                                    {t.name}
                                </button>
                            )
                        })}
                    </div>
                    <label className="label cursor-pointer justify-start gap-2 mt-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={dimOthers}
                            onChange={(e) => setDimOthers(e.target.checked)}
                        />
                        <span className="text-sm">Többi elhalványítása</span>
                    </label>
                    {highlightTypeIds.length > 0 && (
                        <button
                            className="btn btn-xs btn-outline mt-2 w-fit"
                            onClick={() => setHighlightTypeIds([])}
                        >
                            Kiemelés törlése
                        </button>
                    )}
                </div>

                <div className="text-xs opacity-70">
                    Terem: {nameOf(hoveredId)}
                </div>
            </div>

            <div className="rounded-xl w-full" style={{ minWidth: 0 }}>
                <KioskView3D
                    graph={graph}
                    isolatedFloor={isolatedFloor}
                    selection={selection ?? undefined}
                    highlight={highlight}
                    path={path}
                    onFloorClick={handleFloorClick}
                    onClassroomClick={handleClassroomClick}
                    onClassroomHover={setHoveredId}
                    className="border border-slate-700 rounded-lg"
                />
            </div>
        </div>
    )
}
