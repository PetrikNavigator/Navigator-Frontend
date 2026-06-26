import { useTranslation } from "react-i18next"
import type { Classroom } from "../../../types/navigator/Classroom"
import type { Building } from "../../../types/navigator/Building"

type Props = {
    buildings: Building[]
    classrooms: Classroom[]
    onRemove: (c: Classroom) => void
    onEdit: (c: Classroom) => void
    onHover: (c: Classroom) => void
}

export default function ClassroomsTable({ classrooms, buildings, onRemove, onEdit, onHover }: Props) {
    const { t } = useTranslation()

    const buildingName = (id: string) => {
        const building = buildings.find(x => x.id === id)
        return building ? t(building.name) : ""
    }

    return (
        <div>


            <table className="table table-pin-rows">
                <thead>
                    <tr>
                        <th>{t("ui.common.name")}</th>
                        <th>{t("ui.common.building")}</th>
                        <th>{t("ui.common.floor")}</th>
                        <th>{t("ui.classroom.capacity")}</th>
                        <th className="w-40"></th>
                    </tr>
                </thead>

                <tbody>
                    {classrooms.map((c) => (
                        <tr onMouseOver={() => onHover(c)}
                            className="hover:bg-base-200"
                            key={c.id.toString()}
                        >
                            <td>{t(c.name)}</td>
                            <td>{buildingName(c.building_id)}</td>
                            <td>{c.storey === 0 ? t("ui.floor.ground") : c.storey}</td>
                            <td>{c.capacity}</td>
                            <td className="table-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => onEdit(c)}
                                >
                                    {t("ui.common.edit")}
                                </button>
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={() => onRemove(c)}
                                >
                                    {t("ui.common.delete")}
                                </button>
                            </td>
                        </tr>
                    ))}

                    {classrooms.length === 0 && (
                        <tr>
                            <td
                                colSpan={4}
                                className="text-center text-base-content/60 py-8"
                            >
                                {t("ui.classroom.empty")}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
