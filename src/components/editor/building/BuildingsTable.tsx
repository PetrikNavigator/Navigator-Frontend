import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BuildingEditorModal from "./BuildingEditorModal";
import type { Building } from "../../../types/navigator/Building";
import { useBuildings } from "../../../contexts/navigator/BuildingContext";

export default function BuildingsTable() {
    const { t } = useTranslation()
    const { buildings, getBuildings, deleteBuilding } = useBuildings()

    const [editing, setEditing] = useState<Building | null>(null)
    const [open, setOpen] = useState(false)

    const onRemove = async (building: Building) => {
        const res = confirm(t("ui.confirm.delete", { name: t(building.name) }))
        if (res)
            await deleteBuilding(building.id)
    }

    const onCreate = () => {
        setEditing(null)
        setOpen(true)
    }

    const onEdit = (building: Building) => {
        setEditing(building)
        setOpen(true)
    }

    useLayoutEffect(() => {
        getBuildings()
    }, [])

    return (
        <>
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    <button className="btn btn-primary w-max mb-4" onClick={onCreate}>
                        {t("ui.building.add")}
                    </button>
                    <div className="overflow-x-auto max-h-[80vh]">
                        <table className="table table-pin-rows">
                            <thead>
                                <tr>
                                    <th>{t("ui.common.name")}</th>
                                    <th>{t("ui.common.description")}</th>
                                    <th className="w-32"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {buildings.map((b) => (
                                    <tr
                                        key={b.id.toString()}
                                    >
                                        <td className="font-medium">{t(b.name)}</td>

                                        <td>{b.description ? t(b.description) : "—"}</td>

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

                                {buildings.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-center text-base-content/60 py-8"
                                        >
                                            {t("ui.building.empty")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <BuildingEditorModal
                open={open}
                building={editing}
                setOpen={setOpen}
            />
        </>
    )
}
