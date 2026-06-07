import { useEffect, useMemo, useState } from "react"
import type { FullGraph } from "../../types/FullGraph"
import type { EditorFilter } from "../../three/editor/types"

type Props = {
    graph: FullGraph | null
    /** Emits the current filter + dim-others flag whenever a control changes. */
    onChange: (filter: EditorFilter, dimOthers: boolean) => void
    /** Hide the classroom-type filter (e.g. on the building/lift tabs where
     *  it is not meaningful). Defaults to shown. */
    showTypeFilter?: boolean
    className?: string
}

function toggle<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
}

/** Kiosk-style dynamic view controls for the editor: filter the campus by
 *  building / storey / classroom type and dim non-highlighted entities.
 *  Self-managing — emits the resulting `EditorFilter` + `dimOthers` via
 *  `onChange`; the host folds those into the `EditorView3D` appearance. */
export default function EditorViewControls({
    graph,
    onChange,
    showTypeFilter = true,
    className = "",
}: Props) {
    const [buildingIds, setBuildingIds] = useState<string[]>([])
    const [storeys, setStoreys] = useState<number[]>([])
    const [typeIds, setTypeIds] = useState<string[]>([])
    const [dimOthers, setDimOthers] = useState(false)

    // Every storey that appears anywhere in the graph, sorted.
    const allStoreys = useMemo(() => {
        if (!graph) return [] as number[]
        const set = new Set<number>()
        graph.classrooms.forEach((c) => set.add(c.storey))
        graph.corridors.forEach((c) => set.add(c.storey))
        const span = (lo: number, hi: number) => {
            for (let s = lo; s <= hi; s++) set.add(s)
        }
        graph.lifts.forEach((l) => span(l.min_storey, l.max_storey))
        graph.stairs.forEach((s) => span(s.min_storey, s.max_storey))
        return [...set].sort((a, b) => a - b)
    }, [graph])

    useEffect(() => {
        onChange({ buildingIds, storeys, typeIds }, dimOthers)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildingIds, storeys, typeIds, dimOthers])

    const reset = () => {
        setBuildingIds([])
        setStoreys([])
        setTypeIds([])
    }

    const hasFilter = buildingIds.length > 0 || storeys.length > 0 || typeIds.length > 0

    return (
        <div className={`card bg-base-200 p-3 space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Nézet szűrése</h2>
                {hasFilter && (
                    <button className="btn btn-xs btn-outline" onClick={reset}>
                        Visszaállítás
                    </button>
                )}
            </div>

            {/* Building filter */}
            <div>
                <div className="text-xs opacity-70 mb-1">Épület</div>
                <div className="flex flex-wrap gap-1">
                    {graph?.buildings.map((b) => (
                        <button
                            key={b.id}
                            onClick={() => setBuildingIds((p) => toggle(p, b.id))}
                            className={`btn btn-xs ${buildingIds.includes(b.id) ? "btn-primary" : "btn-outline"}`}
                        >
                            {b.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Storey filter */}
            <div>
                <div className="text-xs opacity-70 mb-1">Emelet</div>
                <div className="flex flex-wrap gap-1">
                    {allStoreys.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStoreys((p) => toggle(p, s))}
                            className={`btn btn-xs ${storeys.includes(s) ? "btn-primary" : "btn-outline"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Classroom type filter */}
            {showTypeFilter && (
                <div>
                    <div className="text-xs opacity-70 mb-1">Terem típus</div>
                    <div className="flex flex-wrap gap-1">
                        {graph?.classroom_types.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTypeIds((p) => toggle(p, t.id))}
                                className={`btn btn-xs ${typeIds.includes(t.id) ? "btn-primary" : "btn-outline"}`}
                            >
                                <span
                                    className="h-2 w-2 rounded-full mr-1"
                                    style={{ background: t.colorhex || "#888" }}
                                />
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <label className="label cursor-pointer justify-start gap-2">
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={dimOthers}
                    onChange={(e) => setDimOthers(e.target.checked)}
                />
                <span className="text-sm">Kiemelés melletti elhalványítás</span>
            </label>
        </div>
    )
}
