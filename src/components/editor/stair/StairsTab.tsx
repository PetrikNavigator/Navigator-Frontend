import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import { useStairs } from "../../../contexts/navigator/StairsContext"
import type { AddStair, Stair } from "../../../types/navigator/Stair"
import StairsTable from "./StairsTable"
import EditorView3D from "../../../three/EditorView3D"
import type { EditorAppearance, EditTarget } from "../../../three/editor/types"
import { useGraph } from "../../../contexts/other/GraphContext"
import useUpdateEffect from "../../../useUpdateEffect"
import StairForm from "./StairForm"
import { CANVAS_BG_DARK, CANVAS_BG_LIGHT } from "../../../types/three/material-types"
import { useTheme } from "../../../contexts/other/ThemeContext"

const emptyForm = {
    name: "",
    x: 0,
    y: 0,
    min_storey: 0,
    max_storey: 1,
    rotation: 0,
    building_id: ""
}

const normalizeDeg0To359 = (deg: number) => ((deg % 360) + 360) % 360
const normalizeRotation = (deg: number) => normalizeDeg0To359(Math.round(deg))

export default function StairsTab() {
    const { t } = useTranslation()
    const { buildings, getBuildings } = useBuildings()
    const { stairs, getStairs, deleteStair, isError, error, addStair, updateStair, clearError, isLoading } = useStairs()
    const { graph, getFullGraph, invalidateGraph } = useGraph()
    const { theme } = useTheme()

    const [editing, setEditing] = useState<Stair | null>(null)
    const [editorOpen, setEditorOpen] = useState(false)

    const [highlightedStairId, setHighlightedStairId] = useState<string | null>(null)

    const [err, setErr] = useState("")
    const [form, setForm] = useState(emptyForm)
    const [buildingId, setBuildingId] = useState("")

    const onClose = () => {
        setEditorOpen(false)
        setEditing(null)
        setHighlightedStairId(null)
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setErr("")
        clearError()

        if (!form.name.trim()) {
            setErr(t("ui.stair.err_name"))
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
            await updateStair(editing.id, { ...form, building_id: buildingId })
        } else {
            await addStair({ ...form, building_id: buildingId })
        }

        setEditorOpen(false)
        setForm(emptyForm)
    }

    const onRemove = async (stair: Stair) => {
        const res = confirm(t("ui.confirm.delete", { name: t(stair.name) }))
        if (res)
            await deleteStair(stair.id)
    }

    const onCreate = () => {
        setEditing(null)
        if (buildings.length > 0)
            setBuildingId(buildings[0].id)

        setEditorOpen(true)
    }

    const onEdit = (stair: Stair) => {
        setEditing(stair)
        setBuildingId(stair.building_id)
        setEditorOpen(true)
    }

    const onHover = (stair: Stair) => {
        setHighlightedStairId(stair.id)
    }

    useEffect(() => {
        setBuildingId("")
        getStairs()
        getBuildings()
        getFullGraph()
        setHighlightedStairId(null)
    }, [])

    useUpdateEffect(() => {
        invalidateGraph()
    }, [stairs])

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
            setHighlightedStairId(null)
            return
        }

        if (buildingId === "") {
            if (buildings.length > 0)
                setBuildingId(buildings[0].id)
        }
    }, [editorOpen])

    const edit: EditTarget | null = editorOpen
        ? {
            kind: "stairs",
            id: editing?.id,
            preview: {
                name: form.name || t("ui.stair.new_placeholder"),
                x: form.x,
                y: form.y,
                min_storey: form.min_storey,
                max_storey: form.max_storey,
                rotation: form.rotation,
                building_id: buildingId,
            },
        }
        : null

    const highlightId = editorOpen ? editing?.id : highlightedStairId
    const appearance: EditorAppearance = {
        emphasis: {
            highlightIds: highlightId ? [highlightId] : [],
            kind: "stairs",
            dimOthers: editorOpen || !!highlightedStairId,
        },
    }

    const background = theme ? CANVAS_BG_DARK : CANVAS_BG_LIGHT

    return (
        <>
            <button className={`btn ${!editorOpen && "btn-primary"} w-max mb-4`} onClick={() => {
                editorOpen ? onClose() : onCreate()
            }}>
                {editorOpen ? t("ui.common.cancel") : t("ui.stair.add")}
            </button>
            <div className="xl:flex xl:space-x-6">
                <div className="overflow-x-auto xl:min-w-[40vw] max-h-[80vh]">
                    {
                        editorOpen ?
                            <>
                                <StairForm
                                    error={err || error}
                                    formData={{ ...form, building_id: buildingId }}
                                    isError={err != "" || isError}
                                    onFormChange={(x) => {
                                        const { building_id, ...rest } = x
                                        if (building_id)
                                            setBuildingId(building_id)

                                        setForm(rest as AddStair)
                                    }}
                                    onSubmit={onSubmit}
                                />
                                <button className="btn btn-primary mt-2" form="stair-form" disabled={isLoading}>
                                    {editing ? t("ui.common.save") : t("ui.common.create")}
                                </button>
                            </>
                            :
                            <StairsTable
                                buildings={buildings}
                                stairs={stairs}
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
                                    : {}),
                                ...(patch.rotation !== undefined
                                    ? {
                                        rotation: normalizeRotation(
                                            patch.rotation
                                        ),
                                    }
                                    : {}),
                            }))
                        }
                    />
                </div>
            </div >
        </>
    )
}