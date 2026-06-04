import { useLayoutEffect, useState } from "react";
import ClassroomTypesEditorModal from "./ClassroomTypeEditorModal";
import type { ClassroomType } from "../../../types/navigator/ClassroomType";
import { useClassroomType } from "../../../contexts/navigator/ClassroomTypesContext";

export default function ClassroomTypesTable() {
    const { classroom_types, getClassroomTypes, deleteClassroomType } = useClassroomType()

    const [editing, setEditing] = useState<ClassroomType | null>(null)
    const [open, setOpen] = useState(false)

    const onRemove = async (classroomType: ClassroomType) => {
        const res = confirm(`Biztos hogy törölöd a(z) ${classroomType.name}?`)
        if (res)
            await deleteClassroomType(classroomType.id)
    }

    const onCreate = () => {
        setEditing(null)
        setOpen(true)
    }

    const onEdit = (classroomType: ClassroomType) => {
        setEditing(classroomType)
        setOpen(true)
    }

    useLayoutEffect(() => {
        getClassroomTypes()
    }, [])

    return (
        <>
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    <button className="btn btn-primary w-max mb-4" onClick={onCreate}>
                        Típus hozzáadása
                    </button>
                    <div className="overflow-x-auto max-h-[80vh]">
                        <table className="table table-pin-rows">
                            <thead>
                                <tr>
                                    <th>Név</th>
                                    <th>Szín</th>
                                    <th className="w-32"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {classroom_types.map((b) => (
                                    <tr
                                        key={b.id.toString()}
                                    >
                                        <td className="font-medium">{b.name}</td>

                                        <td>
                                            <div className="badge text-black" style={{ backgroundColor: b.colorhex }}>{b.colorhex.slice(0, -2)}</div>
                                        </td>

                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => onEdit(b)}
                                                >
                                                    Szerk.
                                                </button>

                                                <button
                                                    className="btn btn-error btn-sm"
                                                    onClick={() => onRemove(b)}
                                                >
                                                    Törlés
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {classroom_types.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center text-base-content/60 py-8"
                                        >
                                            Nincs még típus. Adj hozzá egyet a jobb felső
                                            gombbal.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ClassroomTypesEditorModal
                open={open}
                classroom_type={editing}
                setOpen={setOpen}
            />
        </>
    )
}