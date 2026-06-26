import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { Stair } from "../../../types/navigator/Stair"
import type { Building } from "../../../types/navigator/Building"
import { storeyLabel } from "../../../utils/classroomSearch"

type Props = {
    buildings: Building[]
    stairs: Stair[]
    onRemove: (s: Stair) => void
    onEdit: (s: Stair) => void
    onHover: (s: Stair) => void
}

export default function StairsTable({ stairs, buildings, onRemove, onEdit, onHover }: Props) {
    const { t } = useTranslation()
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)

    const buildingName = (id: string) => {
        const building = buildings.find(x => x.id === id)
        return building ? t(building.name) : ""
    }

    const filteredStairs = selectedBuildingId
        ? stairs.filter(s => s.building_id === selectedBuildingId)
        : stairs

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
                    {filteredStairs.map((s) => (
                        <tr onMouseOver={() => onHover(s)}
                            className="hover:bg-base-200"
                            key={s.id.toString()}
                        >
                            <td>{t(s.name)}</td>
                            <td>{buildingName(s.building_id)}</td>
                            <td>{storeyLabel(s.min_storey, t)}</td>
                            <td>{storeyLabel(s.max_storey, t)}</td>
                            <td className="table-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => onEdit(s)}
                                >
                                    {t("ui.common.edit")}
                                </button>
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={() => onRemove(s)}
                                >
                                    {t("ui.common.delete")}
                                </button>
                            </td>
                        </tr>
                    ))}

                    {filteredStairs.length === 0 && (
                        <tr>
                            <td
                                colSpan={7}
                                className="text-center text-base-content/60 py-8"
                            >
                                {t("ui.stair.empty")}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
