import { useEffect, useState } from "react"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import EditorView3D from "../../../three/EditorView3D"
import type { Building } from "../../../types/navigator/Building"
import Modal from "../../Modal"
import type { EditTarget, EditorAppearance } from "../../../three/editor/types"
import { useGraph } from "../../../contexts/other/GraphContext"
import useUpdateEffect from "../../../useUpdateEffect"

type Props = {
    building: Building | null
    open: boolean
    setOpen: (value: boolean) => void
}

export default function BuildingEditorModal({ building, open, setOpen }: Props) {
    const { isError, error, addBuilding, updateBuilding, isLoading, buildings } = useBuildings()
    const { graph, getFullGraph, invalidateGraph } = useGraph()
    const [form, setForm] = useState<Building>({ id: "", description: "", name: "", x: 0, y: 0 })
    const [err, setErr] = useState<string>("")

    const onClose = () => {
        setOpen(false)
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()

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
        const ix = Math.round(form.x)
        const iy = Math.round(form.y)

        if (editing) {
            await updateBuilding(building.id, {
                name: form.name,
                description: form.description,
                x: ix,
                y: iy,
            })
        } else {
            await addBuilding({
                name: form.name,
                description: form.description,
                x: ix,
                y: iy,
            })
        }

        setOpen(false)
        setForm({ description: "", id: "", name: "", x: 0, y: 0, })
    }

    useEffect(() => {
        if (building) {
            setForm(building)
        }
        else {
            setForm({ description: "", id: "", name: "", x: 0, y: 0, })
        }
    }, [building])

    useUpdateEffect(() => {
        invalidateGraph()
    }, [buildings])

    useEffect(() => {
        getFullGraph()
    }, [open])

    const editing = building !== null

    const edit: EditTarget | null = open
        ? {
            kind: "building",
            id: building?.id,
            preview: {
                name: form.name || "új épület",
                description: form.description,
                x: form.x,
                y: form.y,
            },
        }
        : null

    const appearance: EditorAppearance = {
        emphasis: {
            highlightIds: building?.id ? [building.id] : [],
            kind: "building",
            dimOthers: true,
        },
    }

    return (
        <Modal
            showClose={false}
            title={editing ? "Épület szerkesztése" : "Új épület"}
            open={open}
            onClose={onClose}
            footer={
                <>
                    <button className="btn btn-ghost" onClick={onClose}>
                        Mégse
                    </button>
                    <button className="btn btn-primary" form="building-form" disabled={isLoading}>
                        {editing ? "Mentés" : "Létrehozás"}
                    </button>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                {/* FORM */}
                <form id="building-form" onSubmit={onSubmit} className="space-y-4">
                    {/* NAME */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Név</span>
                        </label>
                        <input
                            className="input input-bordered w-full"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* POSITION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Pozíció X (m)</span>
                            </label>
                            <input
                                type="number"
                                step="1"
                                className="input input-bordered w-full"
                                value={form.x}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        x: Math.round(Number(e.target.value)),
                                    })
                                }
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Pozíció Y (m)</span>
                            </label>
                            <input
                                type="number"
                                step="1"
                                className="input input-bordered w-full"
                                value={form.y}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        y: Math.round(Number(e.target.value)),
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Leírás</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            value={form.description}
                            maxLength={16000}
                            required
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* ERROR */}
                    {isError && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                            <span>{err}</span>
                        </div>
                    )}
                </form>

                {/* SIDEBAR PREVIEW */}
                <aside className="hidden lg:flex flex-col gap-3">
                    <div className="text-xs uppercase tracking-widest opacity-60 font-semibold">
                        3D előnézet
                    </div>

                    <div className="rounded-box overflow-hidden border border-base-300 h-[420px] bg-base-300/20">
                        <EditorView3D
                            graph={graph}
                            edit={edit}
                            appearance={appearance}
                            className="w-full h-full"
                            initialDistance={120}
                            showAxes={true}
                            onTransform={(patch) =>
                                setForm((f) => ({
                                    ...f,
                                    ...(patch.x !== undefined
                                        ? { x: Math.round(patch.x) }
                                        : {}),
                                    ...(patch.y !== undefined
                                        ? { y: Math.round(patch.y) }
                                        : {}),
                                }))
                            }
                        />
                    </div>

                    <p className="text-xs opacity-60 leading-relaxed">
                        A szerkesztett épület termei narancssárgával kiemelve. A kék
                        korongot húzva az épület pozíciója a 3D nézetben is állítható.
                    </p>
                </aside>
            </div>
        </Modal>
    )
}
