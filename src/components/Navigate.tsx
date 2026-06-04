import { useEffect, useMemo, useState } from "react"
import { type Vec3, Pathfinder } from "../three/path/pathfinder"
import type { FullGraph } from "../types/FullGraph"
import type { Classroom } from "../types/navigator/Classroom"
import { useGraph } from "../contexts/other/GraphContext"
import SchoolPreview3D from "../three/SchoolPreview3D"

export default function Navigate() {
    const { graph, getFullGraph, isLoading, isError, error } = useGraph()

    const [fromId, setFromId] = useState("")
    const [toId, setToId] = useState("")
    const [barrierFree, setBarrierFree] = useState(false)
    const [search, setSearch] = useState("")
    const [path, setPath] = useState<Vec3[]>([])
    const [pathInfo, setPathInfo] = useState("")

    const findPath = () => {
        setPathInfo("")
        setPath([])
        if (!graph) return

        const pathfinder = new Pathfinder(graph, barrierFree)
        const result = pathfinder.findPath(fromId, toId)

        if (result.length < 2) {
            setPathInfo("Nem található útvonal a megadott pontok között.")
            return
        }

        const totalDist = result.reduce((acc, p, i) => {
            if (i === 0) return acc
            const prev = result[i - 1]
            const dx = p.x - prev.x
            const dy = p.y - prev.y
            const dz = p.z - prev.z
            return acc + Math.sqrt(dx * dx + dy * dy + dz * dz)
        }, 0)

        setPath(result)
        setPathInfo(
            `Útvonal megtalálva — ${result.length} pont, kb. ${totalDist.toFixed(1)} m.`,
        )
    }

    const swap = () => {
        setFromId(toId)
        setToId(fromId)
    }

    useEffect(() => {
        getFullGraph()
    }, [])

    const sortedClassrooms = useMemo(() => {
        if (!graph) return []
        return [...graph.classrooms].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true }),
        )
    }, [graph])

    const filteredClassrooms = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return sortedClassrooms
        return sortedClassrooms.filter(
            c =>
                c.name.toLowerCase().includes(q) ||
                (c.description ?? "").toLowerCase().includes(q),
        )
    }, [sortedClassrooms, search])


    const fromFiltered = filteredClassrooms.filter(x => x.id !== toId)
    const toFiltered = filteredClassrooms.filter(x => x.id !== fromId)

    return (
        <div className="xl:flex xl:space-x-6 h-full w-full">
            <div className="overflow-x-auto flex-shrink-0 w-80">
                <h1 className="text-2xl font-bold text-primary">Útvonaltervező</h1>

                <p className="mb-5 text-sm opacity-70"></p>

                {isLoading && (
                    <div className="alert alert-info mt-3">
                        <span>Adatok betöltése…</span>
                    </div>
                )}

                {isError && (
                    <div className="alert alert-error mt-3">
                        <span>Hiba: {error ?? "ismeretlen"}</span>
                    </div>
                )}

                <label className="label mt-3">
                    <span className="label-text">Keresés a termek között</span>
                </label>
                <input
                    className="input input-bordered w-full"
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Pl. 218 vagy könyvtár"
                />

                <label className="label mt-3">
                    <span className="label-text">Kiindulás</span>
                </label>
                <select
                    className="select select-bordered w-full"
                    value={fromId}
                    onChange={e => setFromId(e.target.value)}
                >
                    <option value="">— válassz —</option>
                    {fromFiltered.map(c => (
                        <option key={c.id.toString()} value={c.id.toString()}>
                            {classroomLabel(c, graph)}
                        </option>
                    ))}
                </select>

                <label className="label mt-3">
                    <span className="label-text">Cél</span>
                </label>
                <select
                    className="select select-bordered w-full"
                    value={toId}
                    onChange={e => setToId(e.target.value)}
                >
                    <option value="">— válassz —</option>
                    {toFiltered.map(c => (
                        <option key={c.id.toString()} value={c.id.toString()}>
                            {classroomLabel(c, graph)}
                        </option>
                    ))}
                </select>

                <label className="label cursor-pointer justify-start gap-3 py-4">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={barrierFree}
                        onChange={e => setBarrierFree(e.target.checked)}
                    />
                    <span>Akadálymentes (liftek)</span>
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        className="btn btn-primary flex-1"
                        onClick={findPath}
                        disabled={fromId === "" || toId === ""}
                    >
                        Útvonal keresése
                    </button>
                    <button
                        className="btn btn-outline flex-1"
                        onClick={swap}
                        disabled={fromId === "" || toId === ""}
                    >
                        Csere
                    </button>
                </div>

                {pathInfo && (
                    <div className="alert alert-success mt-4">
                        <span>{pathInfo}</span>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-2 text-sm">
                    <LegendDot color="#55ddff" label="Kiindulás" />
                    <LegendDot color="#ff5577" label="Cél" />
                    <LegendDot color="#00ff88" label="Útvonal" />
                </div>
            </div>

            <div className="rounded-xl w-full min-h-[100%]" style={{ minWidth: 0 }}>
                <SchoolPreview3D
                    graph={graph}
                    path={path}
                    className="border border-slate-700 rounded-lg"
                    highlight={{
                        dimOthers: true,
                        isEditing: false,
                        kind: "building"
                    }}
                />
            </div>
        </div>
    )
}

function classroomLabel(c: Classroom, graph: FullGraph | null): string {
    const building = graph?.buildings.find(b => b.id === c.building_id)
    const buildingName = building?.name ?? "?"
    return `${c.name} — ${buildingName}, ${c.storey}. emelet`
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
            />
            <span>{label}</span>
        </div>
    )
}
