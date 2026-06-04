import { useEffect, useState } from "react"
import Modal from "../../Modal"
import type { ClassroomType } from "../../../types/navigator/ClassroomType"
import { useClassroomType } from "../../../contexts/navigator/ClassroomTypesContext"

type Props = {
    classroom_type: ClassroomType | null
    open: boolean
    setOpen: (value: boolean) => void
}

const empty = { colorhex: "#ffffff", name: "" }

export default function ClassroomTypesEditorModal({ classroom_type, open, setOpen }: Props) {
    const { isError, error, createClassroomType, updateClassroomType, isLoading } = useClassroomType()
    const [form, setForm] = useState(empty)
    const [err, setErr] = useState<string>("")

    const onClose = () => {
        setOpen(false)
    }

    const onSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()

        if (!form.name.trim()) {
            setErr("Add meg a típus nevét")
            return
        }

        if (editing) {
            await updateClassroomType(classroom_type.id, {
                colorhex: form.colorhex + "ff",
                name: form.name
            })
        } else {
            await createClassroomType({
                colorhex: form.colorhex + "ff",
                name: form.name,
            })
        }

        setOpen(false)
        setForm(empty)
    }

    useEffect(() => {
        if (classroom_type) {
            setForm(classroom_type)
        }
        else {
            setForm(empty)
        }
    }, [classroom_type])

    const editing = classroom_type !== null

    return (
        <Modal
            showClose={false}
            title={editing ? "Típus szerkesztése" : "Új típus"}
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

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Szín</span>
                        </label>
                        <input
                            type="color"
                            className="input input-bordered w-full"
                            value={form.colorhex}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    colorhex: e.target.value,
                                })
                            }
                        />
                    </div>

                    {isError && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                            <span>{err}</span>
                        </div>
                    )}
                </form>
            </div>
        </Modal>
    )
}
