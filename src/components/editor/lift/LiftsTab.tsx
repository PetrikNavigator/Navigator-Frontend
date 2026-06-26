import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import { useLifts } from "../../../contexts/navigator/LiftsContext"
import type { AddLift, Lift } from "../../../types/navigator/Lift"
import LiftsTable from "./LiftsTable"
import EditorView3D from "../../../three/EditorView3D"
import type { EditorAppearance, EditTarget } from "../../../three/editor/types"
import { useGraph } from "../../../contexts/other/GraphContext"
import useUpdateEffect from "../../../useUpdateEffect"
import LiftForm from "./LiftForm"
import { CANVAS_BG_DARK, CANVAS_BG_LIGHT } from "../../../types/three/material-types"
import { useTheme } from "../../../contexts/other/ThemeContext"

const emptyForm = {
    name: "",
    x: 0,
    y: 0,
    min_storey: 0,
    max_storey: 1,
    building_id: ""
}

export default function LiftsTab() {
    const { t } = useTranslation()
    const { buildings, getBuildings } = useBuildings()
    const { lifts, getLifts, deleteLift, isError, error, addLift, updateLift, clearError, isLoading } = useLifts()
    const { graph, getFullGraph, invalidateGraph } = useGraph()
    const { theme } = useTheme()

    const [editing, setEditing] = useState<Lift | null>(null)
    const [editorOpen, setEditorOpen] = useState(false)

    const [highlightedLiftId, setHighlightedLiftId] = useState<string | null>(null)

    const [err, setErr] = useState("")
    const [form, setForm] = useState(emptyForm)
    const [buildingId, setBuildingId] = useState("")

    const onClose = () => {
        setEditorOpen(false)
        setEditing(null)
        setHighlightedLiftId(null)
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setErr("")
        clearError()

        if (!form.name.trim()) {
            setErr(t("ui.lift.err_name"))
            return
        }
        if (!Number.isFinite(form.x) || !Number.isFinite(form.y)) {
            setErr(t("ui.common.err_position_number"))
            return
        }
        if (form.min_storey > form.max_storey) {
            setErr(t("ui.common.err_min_max"))
            return
        }

        if (editing) {
            await updateLift(editing.id, { ...form, building_id: buildingId })
        } else {
            await addLift({ ...form, building_id: buildingId })
        }

        setEditorOpen(false)
        setForm(emptyForm)
    }

    const onRemove = async (lift: Lift) => {
        const res = confirm(t("ui.confirm.delete", { name: t(lift.name) }))
        if (res)
            await deleteLift(lift.id)
    }

    const onCreate = () => {
        setEditing(null)
        if (buildings.length > 0)
            setBuildingId(buildings[0].id)

        setEditorOpen(true)
    }

    const onEdit = (lift: Lift) => {
        setEditing(lift)
        setBuildingId(lift.building_id)
        setEditorOpen(true)
    }

    const onHover = (lift: Lift) => {
        setHighlightedLiftId(lift.id)
    }

    useEffect(() => {
        setBuildingId("")
        getLifts()
        getBuildings()
        getFullGraph()
        setHighlightedLiftId(null)
    }, [])

    useUpdateEffect(() => {
        invalidateGraph()
    }, [lifts])

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
            setHighlightedLiftId(null)
            return
        }

        if (buildingId === "") {
            if (buildings.length > 0)
                setBuildingId(buildings[0].id)
        }
    }, [editorOpen])

    const edit: EditTarget | null = editorOpen
        ? {
            kind: "lift",
            id: editing?.id,
            preview: {
                name: form.name || t("ui.lift.new_placeholder"),
                x: form.x,
                y: form.y,
                min_storey: form.min_storey,
                max_storey: form.max_storey,
                building_id: buildingId,
            },
        }
        : null

    const highlightId = editorOpen ? editing?.id : highlightedLiftId
    const appearance: EditorAppearance = {
        emphasis: {
            highlightIds: highlightId ? [highlightId] : [],
            kind: "lift",
            dimOthers: editorOpen || !!highlightedLiftId,
        },
    }

    const background = theme ? CANVAS_BG_DARK : CANVAS_BG_LIGHT

    return (
        <>
            <button className={`btn ${!editorOpen && "btn-primary"} w-max mb-4`} onClick={() => {
                editorOpen ? onClose() : onCreate()
            }}>
                {editorOpen ? t("ui.common.cancel") : t("ui.lift.add")}
            </button>
            <div className="xl:flex xl:space-x-6">
                <div className="overflow-x-auto xl:min-w-[40vw] max-h-[80vh]">
                    {
                        editorOpen ?
                            <>
                                <LiftForm
                                    error={err || error}
                                    formData={{ ...form, building_id: buildingId }}
                                    isError={err != "" || isError}
                                    onFormChange={(x) => {
                                        const { building_id, ...rest } = x
                                        if (building_id)
                                            setBuildingId(building_id)

                                        setForm(rest as AddLift)
                                    }}
                                    onSubmit={onSubmit}
                                />
                                <button className="btn btn-primary mt-2" form="lift-form" disabled={isLoading}>
                                    {editing ? t("ui.common.save") : t("ui.common.create")}
                                </button>
                            </>
                            :
                            <LiftsTable
                                buildings={buildings}
                                lifts={lifts}
                                onEdit={onEdit}
                                onRemove={onRemove}
                                onHover={onHover}
                            />
                    }
                </div>

                <div className="hidden xl:flex rounded-xl w-full border border-slate-700 overflow-hidden h-[80vh]">
                    <EditorView3D
                        className="w-full h-full"
                        initialDistance={120}
                        showAxes
                        background={background}
                        graph={graph}
                        edit={edit}
                        appearance={appearance}
                        onTransform={(patch) =>
                            setForm((f) => ({
                                ...f,
                                ...(patch.x !== undefined
                                    ? { x: Math.round(patch.x) }
                                    : {}),
                                ...(patch.y !== undefined
                                    ? { y: Math.round(patch.y) }
                                    : {}),
                                ...(patch.min_storey !== undefined
                                    ? { min_storey: patch.min_storey }
                                    : {}),
                                ...(patch.max_storey !== undefined
                                    ? { max_storey: patch.max_storey }
                                    : {})
                            }))
                        }
                    />
                </div>
            </div>
        </>
    )
}