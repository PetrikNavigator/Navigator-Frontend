import { useTranslation } from "react-i18next"
import type { Corridor } from "../../../types/navigator/Corridor"
import type { Building } from "../../../types/navigator/Building"
import { storeyLabel } from "../../../utils/classroomSearch"

type Props = {
    buildings: Building[]
    corridors: Corridor[]
    onRemove: (c: Corridor) => void
    onEdit: (c: Corridor) => void
    onHover: (c: Corridor) => void
}

export default function CorridorsTable({ corridors, buildings, onRemove, onEdit, onHover }: Props) {
    const { t } = useTranslation()

    const buildingName = (id: string) => {
        const building = buildings.find(x => x.id === id)
        return building ? t(building.name) : ""
    }

    return (
        <table className="table table-pin-rows">
            <thead>
                <tr>
                    <th>{t("ui.common.name")}</th>
                    <th>{t("ui.common.building")}</th>
                    <th>{t("ui.common.floor")}</th>
                    <th>{t("ui.corridor.barrier_free_short")}</th>
                    <th>{t("ui.corridor.outdoor_short")}</th>
                    <th className="w-40"></th>
                </tr>
            </thead>

            <tbody>
                {corridors.map((c) => (
                    <tr onMouseOver={() => onHover(c)}
                        className="hover:bg-base-200"
                        key={c.id.toString()}
                    >
                        <td>{t(c.name)}</td>
                        <td>{buildingName(c.building_id)}</td>
                        <td>{storeyLabel(c.storey, t)}</td>
                        <td>{c.barrier_free ? t("ui.common.yes") : t("ui.common.no")}</td>
                        <td>{c.is_outdoor ? t("ui.common.yes") : t("ui.common.no")}</td>
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

                {corridors.length === 0 && (
                    <tr>
                        <td
                            colSpan={9}
                            className="text-center text-base-content/60 py-8"
                        >
                            {t("ui.corridor.empty")}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}
