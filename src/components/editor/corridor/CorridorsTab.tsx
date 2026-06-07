import { useState, useEffect, useMemo } from "react"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import { useCorridor } from "../../../contexts/navigator/CorridorContext"
import type { AddCorridor, Corridor } from "../../../types/navigator/Corridor"
import CorridorsTable from "./CorridorsTable"
import EditorView3D from "../../../three/EditorView3D"
import EditorViewControls from "../EditorViewControls"
import type { EditorAppearance, EditorFilter, EditTarget } from "../../../three/editor/types"
import { useGraph } from "../../../contexts/other/GraphContext"
import useUpdateEffect from "../../../useUpdateEffect"
import CorridorForm from "./CorridorForm"

const emptyForm = {
    name: "",
    storey: 0,
    x1: 0,
    y1: 0,
    x2: 5,
    y2: 0,
    width: 2,
    barrier_free: false,
    is_outdoor: false,
    building_id: ""
}

export default function CorridorsTab() {
    const { buildings, getBuildings } = useBuildings()
    const { corridors, getCorridors, deleteCorridor, isError, error, addCorridor, updateCorridor, clearError, isLoading } = useCorridor()
    const { graph, getFullGraph, invalidateGraph } = useGraph()

    const [editing, setEditing] = useState<Corridor | null>(null)
    const [editorOpen, setEditorOpen] = useState(false)

    const [highlightedCorridorId, setHighlightedCorridorId] = useState<string | null>(null)

    const [filter, setFilter] = useState<EditorFilter>({})
    const [dimOthers, setDimOthers] = useState(false)

    const [err, setErr] = useState("")
    const [form, setForm] = useState(emptyForm)
    const [buildingId, setBuildingId] = useState("")

    const onClose = () => {
        setEditorOpen(false)
        setEditing(null)
        setHighlightedCorridorId(null)
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setErr("")
        clearError()

        if (!form.name.trim()) {
            setErr("Add meg a folyosó nevét")
            return
        }
        if (
            !Number.isFinite(form.x1) ||
            !Number.isFinite(form.y1) ||
            !Number.isFinite(form.x2) ||
            !Number.isFinite(form.y2)
        ) {
            setErr("A pozícióknak érvényes számoknak kell lenniük")
            return
        }
        if (form.x1 === form.x2 && form.y1 === form.y2) {
            setErr("A kezdő- és végpont nem lehet ugyanaz")
            return
        }
        if (form.width <= 0) {
            setErr("A szélességnek pozitívnak kell lennie")
            return
        }

        if (editing) {
            await updateCorridor(editing.id, { ...form, building_id: buildingId })
        } else {
            await addCorridor({ ...form, building_id: buildingId })
        }

        setEditorOpen(false)
        setForm(emptyForm)
    }

    const onRemove = async (corridor: Corridor) => {
        const res = confirm(`Biztos hogy törölöd a(z) ${corridor.name}?`)
        if (res)
            await deleteCorridor(corridor.id)
    }

    const onCreate = () => {
        setEditing(null)
        if (buildings.length > 0)
            setBuildingId(buildings[0].id)

        setEditorOpen(true)
    }

    const onEdit = (corridor: Corridor) => {
        setEditing(corridor)
        setBuildingId(corridor.building_id)
        setEditorOpen(true)
    }

    const onHover = (corridor: Corridor) => {
        setHighlightedCorridorId(corridor.id)
    }

    useEffect(() => {
        setBuildingId("")
        getCorridors()
        getBuildings()
        getFullGraph()
        setHighlightedCorridorId(null)
    }, [])

    useUpdateEffect(() => {
        invalidateGraph()
    }, [corridors])

    useEffect(() => {
        if (editing) {
            const { id, ...rest } = editing
            setForm(rest)
        }
        else {
            setForm(emptyForm)
        }
    }, [editing])

    useEffect(() => {
        if (!editorOpen) {
            setHighlightedCorridorId(null)
            return
        }

        if (buildingId === "") {
            if (buildings.length > 0)
                setBuildingId(buildings[0].id)
        }
    }, [editorOpen])

    const edit = useMemo<EditTarget | null>(() => (
        editorOpen
            ? {
                kind: "corridor",
                id: editing?.id,
                preview: {
                    name: form.name || "új folyosó",
                    storey: form.storey,
                    x1: form.x1,
                    y1: form.y1,
                    x2: form.x2,
                    y2: form.y2,
                    width: form.width,
                    barrier_free: form.barrier_free,
                    is_outdoor: form.is_outdoor,
                    building_id: buildingId,
                },
            }
            : null
    ), [editorOpen, editing?.id, form, buildingId])

    const highlightId = editorOpen ? editing?.id : highlightedCorridorId
    const appearance = useMemo<EditorAppearance>(() => ({
        filter,
        emphasis: {
            highlightIds: highlightId ? [highlightId] : [],
            dimOthers: dimOthers || editorOpen || !!highlightedCorridorId,
        },
    }), [filter, dimOthers, editorOpen, highlightId, highlightedCorridorId])

    return (
        <>
            <button className={`btn ${!editorOpen && "btn-primary"} w-max mb-4`} onClick={() => {
                editorOpen ? onClose() : onCreate()
            }}>
                {editorOpen ? "Mégse" : "Folyosó hozzáadása"}
            </button>
            <div className="xl:flex xl:space-x-6">
                <div className="overflow-x-auto xl:min-w-[40vw] max-h-[80vh]">
                    {
                        editorOpen ?
                            <>
                                <CorridorForm
                                    error={err || error}
                                    formData={{ ...form, building_id: buildingId }}
                                    isError={err != "" || isError}
                                    onFormChange={(x) => {
                                        const { building_id, ...rest } = x
                                        if (building_id)
                                            setBuildingId(building_id)

                                        setForm(rest as AddCorridor)
                                    }}
                                    onSubmit={onSubmit}
                                />
                                <button className="btn btn-primary mt-2" form="corridor-form" disabled={isLoading}>
                                    {editing ? "Mentés" : "Létrehozás"}
                                </button>
                            </>
                            :
                            <CorridorsTable
                                buildings={buildings}
                                corridors={corridors}
                                onEdit={onEdit}
                                onRemove={onRemove}
                                onHover={onHover}
                            />
                    }
                </div>

                <div className="hidden xl:flex flex-col gap-3 w-full h-[80vh]">
                    <EditorViewControls
                        graph={graph}
                        showTypeFilter={false}
                        onChange={(f, d) => { setFilter(f); setDimOthers(d) }}
                    />
                    <div className="flex-1 rounded-xl border border-slate-700 overflow-hidden">
                    <EditorView3D
                        className="w-full h-full"
                        initialDistance={120}
                        showAxes
                        graph={graph}
                        edit={edit}
                        appearance={appearance}
                        onTransform={(patch) =>
                            setForm((f) => ({
                                ...f,
                                ...(patch.x1 !== undefined
                                    ? { x1: Math.round(patch.x1) }
                                    : {}),
                                ...(patch.y1 !== undefined
                                    ? { y1: Math.round(patch.y1) }
                                    : {}),
                                ...(patch.x2 !== undefined
                                    ? { x2: Math.round(patch.x2) }
                                    : {}),
                                ...(patch.y2 !== undefined
                                    ? { y2: Math.round(patch.y2) }
                                    : {}),
                                ...(patch.width !== undefined
                                    ? { width: Math.round(patch.width * 10) / 10 }
                                    : {}),
                            }))
                        }
                    />
                    </div>
                </div>
            </div>
        </>
    )
}
