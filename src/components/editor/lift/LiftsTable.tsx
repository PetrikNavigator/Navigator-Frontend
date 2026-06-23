import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { Lift } from "../../../types/navigator/Lift"
import type { Building } from "../../../types/navigator/Building"
import { storeyLabel } from "../../../utils/classroomSearch"

type Props = {
    buildings: Building[]
    lifts: Lift[]
    onRemove: (l: Lift) => void
    onEdit: (l: Lift) => void
    onHover: (l: Lift) => void
}

export default function LiftsTable({ lifts, buildings, onRemove, onEdit, onHover }: Props) {
    const { t } = useTranslation()
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)

    const buildingName = (id: string) => {
        const building = buildings.find(x => x.id === id)
        return building ? t(building.name) : ""
    }

    const filteredLifts = selectedBuildingId
        ? lifts.filter(l => l.building_id === selectedBuildingId)
        : lifts

    return (
        <div className="space-y-4">
            <fieldset className="fieldset">
                <legend className="label">{t("ui.common.building")}</legend>
                <select
                    className="select select-bordered"
                    value={selectedBuildingId || ""}
                    onChange={(e) => setSelectedBuildingId(e.target.value || null)}
                >
                    <option value="">{t("ui.common.all")}</option>
                    {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                            {t(b.name)}
                        </option>
                    ))}
                </select>
            </fieldset>
            <table className="table table-pin-rows">
                <thead>
                    <tr>
                        <th>{t("ui.common.name")}</th>
                        <th>{t("ui.common.building")}</th>
                        <th>{t("ui.common.min_storey_short")}</th>
                        <th>{t("ui.common.max_storey_short")}</th>
                        <th className="w-40"></th>
                    </tr>
                </thead>

                <tbody>
                    {filteredLifts.map((l) => (
                        <tr onMouseOver={() => onHover(l)}
                            className="hover:bg-base-200"
                            key={l.id.toString()}
                        >
                            <td>{t(l.name)}</td>
                            <td>{buildingName(l.building_id)}</td>
                            <td>{storeyLabel(l.min_storey, t)}</td>
                            <td>{storeyLabel(l.max_storey, t)}</td>
                            <td className="table-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => onEdit(l)}
                                >
                                    {t("ui.common.edit")}
                                </button>
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={() => onRemove(l)}
                                >
                                    {t("ui.common.delete")}
                                </button>
                            </td>
                        </tr>
                    ))}

                    {filteredLifts.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="text-center text-base-content/60 py-8"
                            >
                                {t("ui.lift.empty")}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
