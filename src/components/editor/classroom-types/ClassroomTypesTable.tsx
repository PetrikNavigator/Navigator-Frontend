import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ClassroomTypesEditorModal from "./ClassroomTypeEditorModal";
import type { ClassroomType } from "../../../types/navigator/ClassroomType";
import { useClassroomType } from "../../../contexts/navigator/ClassroomTypesContext";

export default function ClassroomTypesTable() {
    const { t } = useTranslation()
    const { classroom_types, getClassroomTypes, deleteClassroomType } = useClassroomType()

    const [editing, setEditing] = useState<ClassroomType | null>(null)
    const [open, setOpen] = useState(false)

    const onRemove = async (classroomType: ClassroomType) => {
        const res = confirm(t("ui.confirm.delete", { name: t(classroomType.name) }))
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
                        {t("ui.type.add")}
                    </button>
                    <div className="overflow-x-auto max-h-[80vh]">
                        <table className="table table-pin-rows">
                            <thead>
                                <tr>
                                    <th>{t("ui.common.name")}</th>
                                    <th>{t("ui.common.color")}</th>
                                    <th className="w-32"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {classroom_types.map((b) => (
                                    <tr
                                        key={b.id.toString()}
                                    >
                                        <td className="font-medium">{t(b.name)}</td>

                                        <td>
                                            <div className="badge text-black" style={{ backgroundColor: b.colorhex }}>{b.colorhex.toUpperCase()}</div>
                                        </td>

                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => onEdit(b)}
                                                >
                                                    {t("ui.common.edit")}
                                                </button>

                                                <button
                                                    className="btn btn-error btn-sm"
                                                    onClick={() => onRemove(b)}
                                                >
                                                    {t("ui.common.delete")}
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
                                            {t("ui.type.empty")}
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
