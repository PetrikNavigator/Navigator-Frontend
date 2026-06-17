import { useState, useEffect, useMemo } from "react"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import { useClassroom } from "../../../contexts/navigator/ClassroomContext"
import type { AddClassroom, Classroom } from "../../../types/navigator/Classroom"
import ClassroomsTable from "./ClassroomsTable"
import EditorView3D from "../../../three/EditorView3D"
import type { EditorAppearance, EditorFilter, EditTarget } from "../../../three/editor/types"
import { useGraph } from "../../../contexts/other/GraphContext"
import useUpdateEffect from "../../../useUpdateEffect"
import ClassroomForm from "./ClassroomForm"
import { useClassroomType } from "../../../contexts/navigator/ClassroomTypesContext"
import { CANVAS_BG_DARK, CANVAS_BG_LIGHT } from "../../../types/three/material-types"
import { useTheme } from "../../../contexts/other/ThemeContext"

const emptyForm = {
    description: "",
    name: "",
    rotation: 0,
    size_x: 5,
    size_y: 5,
    size_z: 3,
    capacity: 1,
    storey: 0,
    x: 0,
    y: 0
}

const normalizeDeg0To359 = (deg: number) => ((deg % 360) + 360) % 360
const normalizeDoorRotation = (deg: number) => normalizeDeg0To359(Math.round(deg))

export default function ClassroomsTab() {
    const { buildings, getBuildings } = useBuildings()
    const { classrooms, getClassrooms, deleteClassroom, isError, error, createClassroom, updateClassroom, clearError, isLoading } = useClassroom()
    const { classroom_types, getClassroomTypes } = useClassroomType()
    const { graph, getFullGraph, invalidateGraph } = useGraph()
    const { theme } = useTheme()

    const [editing, setEditing] = useState<Classroom | null>(null)
    const [editorOpen, setEditorOpen] = useState(false)

    const [highlightedClassroomId, setHighlightedClassroomId] = useState<string | null>(null)

    const [err, setErr] = useState("")
    const [form, setForm] = useState(emptyForm)
    const [buildingId, setBuildingId] = useState("")
    const [typeId, setTypeId] = useState("")

    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
    const [selectedFloor, setSelectedFloor] = useState<string>("")

    const onClose = () => {
        setEditorOpen(false)
        setEditing(null)
        setHighlightedClassroomId(null)
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setErr("")
        clearError()

        if (!form.name.trim()) {
            setErr("Add meg az épület nevét")
            return
        }
        if (!form.description.trim()) {
            setErr("Add meg az épület leírását")
            return
        }
        if (!Number.isFinite(form.x) || !Number.isFinite(form.y)) {
            setErr("A pozíciónak érvényes számnak kell lennie")
            return
        }

        if (editing) {
            await updateClassroom(editing.id, { ...form, type_id: typeId, building_id: buildingId })
        } else {
            await createClassroom({ ...form, type_id: typeId, building_id: buildingId })
        }

        setEditorOpen(false)
        setForm(emptyForm)
    }

    const onRemove = async (classroom: Classroom) => {
        const res = confirm(`Biztos hogy törölöd a(z) ${classroom.name}?`)
        if (res)
            await deleteClassroom(classroom.id)
    }

    const onCreate = () => {
        setEditing(null)
        if (buildings.length > 0)
            setBuildingId(buildings[0].id)
        if (classroom_types.length > 0)
            setTypeId(classroom_types[0].id)

        setEditorOpen(true)
    }

    const onEdit = (classroom: Classroom) => {
        setEditing(classroom)
        setBuildingId(classroom.building_id)
        setTypeId(classroom.type_id)
        setEditorOpen(true)
    }

    const onHover = (classroom: Classroom) => {
        setHighlightedClassroomId(classroom.id)
    }

    useEffect(() => {
        setBuildingId("")
        setTypeId("")
        getClassrooms()
        getBuildings()
        getFullGraph()
        setHighlightedClassroomId(null)
        getClassroomTypes()
    }, [])

    useUpdateEffect(() => {
        invalidateGraph()
    }, [classrooms])

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
            setHighlightedClassroomId(null)
            return
        }

        if (buildingId === "") {
            if (buildings.length > 0)
                setBuildingId(buildings[0].id)
        }

        if (typeId === "") {
            if (classroom_types.length > 0)
                setTypeId(classroom_types[0].id)
        }
    }, [editorOpen])

    const edit: EditTarget | null = editorOpen
        ? {
            kind: "classroom",
            id: editing?.id,
            preview: {
                name: form.name || "új terem",
                capacity: form.capacity,
                storey: form.storey,
                x: form.x,
                y: form.y,
                rotation: form.rotation,
                size_x: form.size_x,
                size_y: form.size_y,
                size_z: form.size_z,
                description: form.description,
                building_id: buildingId,
                type_id: typeId,
            },
        }
        : null

    const highlightId = editorOpen ? editing?.id : highlightedClassroomId

    const filter = {
        buildingIds: (selectedBuildingId ? [selectedBuildingId] : undefined),
        storeys: (selectedFloor !== "" ? [Number(selectedFloor)] : undefined)
    } as EditorFilter

    const appearance: EditorAppearance = {
        filter,
        emphasis: {
            highlightIds: highlightId ? [highlightId] : [],
            kind: "classroom",
            dimOthers: false || editorOpen || !!highlightedClassroomId,
        },
    }

    const availableFloors = [...new Set(classrooms.map(x => x.storey))].toSorted()

    const filteredClassrooms = useMemo(() => {
        return classrooms.filter(c => (selectedBuildingId ? c.building_id === selectedBuildingId : true) && (selectedFloor !== "" ? c.storey === Number(selectedFloor) : true))
    }, [selectedFloor, selectedBuildingId, classrooms])

    const background = theme ? CANVAS_BG_DARK : CANVAS_BG_LIGHT

    return (
        <>
            <button className={`btn ${!editorOpen && "btn-primary"} w-max mb-4`} onClick={() => {
                editorOpen ? onClose() : onCreate()
            }}>
                {editorOpen ? "Mégse" : "Terem hozzáadása"}
            </button>
            <div className="xl:flex xl:space-x-6">
                <div className="overflow-x-auto xl:min-w-[40vw] max-h-[80vh]">
                    {
                        editorOpen ?
                            <>
                                <ClassroomForm
                                    error={err || error}
                                    formData={{ ...form, type_id: typeId, building_id: buildingId }}
                                    isError={err != "" || isError}
                                    onFormChange={(x) => {
                                        const { building_id, type_id, ...rest } = x
                                        if (building_id)
                                            setBuildingId(building_id)
                                        if (type_id)
                                            setTypeId(type_id)

                                        setForm(rest as AddClassroom)
                                    }}
                                    onSubmit={onSubmit}
                                />
                                <button className="btn btn-primary mt-2" form="classroom-form" disabled={isLoading}>
                                    {editing ? "Mentés" : "Létrehozás"}
                                </button>
                            </>
                            :
                            <>
                                <div className="flex space-x-2">
                                    <fieldset className="fieldset">
                                        <legend className="label">Épület</legend>
                                        <select
                                            className="select select-bordered"
                                            value={selectedBuildingId || ""}
                                            onChange={(e) => setSelectedBuildingId(e.target.value || null)}
                                        >
                                            <option value="">Összes</option>
                                            {buildings.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.name}
                                                </option>
                                            ))}
                                        </select>
                                    </fieldset>

                                    <fieldset className="fieldset">
                                        <legend className="label">Szint</legend>
                                        <select
                                            className="select select-bordered"
                                            value={selectedFloor}
                                            onChange={(e) => setSelectedFloor(e.target.value)}
                                        >
                                            <option value="">Összes</option>
                                            {availableFloors.map((b) => (
                                                <option key={b} value={b}>
                                                    {b}
                                                </option>
                                            ))}
                                        </select>
                                    </fieldset>
                                </div>
                                <ClassroomsTable
                                    buildings={buildings}
                                    classrooms={filteredClassrooms}
                                    onEdit={onEdit}
                                    onRemove={onRemove}
                                    onHover={onHover}
                                />
                            </>
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
                                ...(patch.size_x !== undefined
                                    ? {
                                        size_x: Math.round(
                                            patch.size_x
                                        ),
                                    }
                                    : {}),
                                ...(patch.size_y !== undefined
                                    ? {
                                        size_y: Math.round(
                                            patch.size_y
                                        ),
                                    }
                                    : {}),
                                ...(patch.size_z !== undefined
                                    ? {
                                        size_z: Math.round(
                                            patch.size_z
                                        ),
                                    }
                                    : {}),
                                ...(patch.x !== undefined
                                    ? {
                                        x: Math.round(patch.x),
                                    }
                                    : {}),
                                ...(patch.y !== undefined
                                    ? {
                                        y: Math.round(patch.y),
                                    }
                                    : {}),
                                ...(patch.rotation !== undefined
                                    ? {
                                        rotation:
                                            normalizeDoorRotation(
                                                patch.rotation
                                            ),
                                    }
                                    : {}),
                            }))
                        }
                    />
                </div>
            </div>
        </>
    )
}