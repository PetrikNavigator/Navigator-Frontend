import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useBuildings } from "../../../contexts/navigator/BuildingContext"
import EditorView3D from "../../../three/EditorView3D"
import type { Building } from "../../../types/navigator/Building"
import Modal from "../../Modal"
import type { EditTarget, EditorAppearance } from "../../../three/editor/types"
import { useGraph } from "../../../contexts/other/GraphContext"
import useUpdateEffect from "../../../useUpdateEffect"
import { CANVAS_BG_DARK, CANVAS_BG_LIGHT } from "../../../types/three/material-types"
import { useTheme } from "../../../contexts/other/ThemeContext"

type Props = {
    building: Building | null
    open: boolean
    setOpen: (value: boolean) => void
}

export default function BuildingEditorModal({ building, open, setOpen }: Props) {
    const { t } = useTranslation()
    const { isError, error, addBuilding, updateBuilding, isLoading, buildings } = useBuildings()
    const { graph, getFullGraph, invalidateGraph } = useGraph()
    const { theme } = useTheme()
    const [form, setForm] = useState<Building>({ id: "", description: "", name: "", x: 0, y: 0 })
    const [err, setErr] = useState<string>("")

    const onClose = () => {
        setOpen(false)
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()

        if (!form.name.trim()) {
            setErr(t("ui.building.err_name"))
            return
        }
        if (!form.description.trim()) {
            setErr(t("ui.building.err_desc"))
            return
        }
        if (!Number.isFinite(form.x) || !Number.isFinite(form.y)) {
            setErr(t("ui.common.err_position_number"))
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
                name: form.name || t("ui.building.new_placeholder"),
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

    const background = theme ? CANVAS_BG_DARK : CANVAS_BG_LIGHT

    return (
        <Modal
            showClose={false}
            title={editing ? t("ui.building.edit_title") : t("ui.building.new_title")}
            open={open}
            onClose={onClose}
            footer={
                <>
                    <button className="btn btn-ghost" onClick={onClose}>
                        {t("ui.common.cancel")}
                    </button>
                    <button className="btn btn-primary" form="building-form" disabled={isLoading}>
                        {editing ? t("ui.common.save") : t("ui.common.create")}
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
                            <span className="label-text">{t("ui.common.name")}</span>
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
                                <span className="label-text">{t("ui.common.pos_x_m")}</span>
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
                                <span className="label-text">{t("ui.common.pos_y_m")}</span>
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
                            <span className="label-text">{t("ui.common.description")}</span>
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
                        {t("ui.common.preview_3d")}
                    </div>

                    <div className="rounded-box overflow-hidden border border-base-300 h-[420px] bg-base-300/20">
                        <EditorView3D
                            graph={graph}
                            edit={edit}
                            appearance={appearance}
                            className="w-full h-full"
                            initialDistance={120}
                            showAxes={true}
                            background={background}
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
                        {t("ui.building.preview_hint")}
                    </p>
                </aside>
            </div>
        </Modal>
    )
}
