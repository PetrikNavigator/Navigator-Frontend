import { useState } from "react"
import type { Stair } from "../../../types/navigator/Stair"
import type { Building } from "../../../types/navigator/Building"

type Props = {
    buildings: Building[]
    stairs: Stair[]
    onRemove: (s: Stair) => void
    onEdit: (s: Stair) => void
    onHover: (s: Stair) => void
}

const storeyLabel = (n: number) => (n === 0 ? "Földszint" : n.toString())

export default function StairsTable({ stairs, buildings, onRemove, onEdit, onHover }: Props) {
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)

    const buildingName = (id: string) => {
        return buildings.find(x => x.id === id)?.name
    }

    const filteredStairs = selectedBuildingId
        ? stairs.filter(s => s.building_id === selectedBuildingId)
        : stairs

    return (
        <div className="space-y-4">
            <fieldset className="fieldset">
                <legend className="label">Épület</legend>
                <select
                    className="select select-bordered"
                    value={selectedBuildingId || ""}
                    onChange={(e) => setSelectedBuildingId(e.target.value || null)}
                >
                    <option value="">Összes</option>
                    {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </fieldset>
            <table className="table table-pin-rows">
                <thead>
                    <tr>
                        <th>Név</th>
                        <th>Épület</th>
                        <th>Min. emelet</th>
                        <th>Max. emelet</th>
                        <th className="w-40"></th>
                    </tr>
                </thead>

                <tbody>
                    {filteredStairs.map((s) => (
                        <tr onMouseOver={() => onHover(s)}
                            className="hover:bg-base-200"
                            key={s.id.toString()}
                        >
                            <td>{s.name}</td>
                            <td>{buildingName(s.building_id)}</td>
                            <td>{storeyLabel(s.min_storey)}</td>
                            <td>{storeyLabel(s.max_storey)}</td>
                            <td className="table-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => onEdit(s)}
                                >
                                    Szerk.
                                </button>
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={() => onRemove(s)}
                                >
                                    Törlés
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
                                Nincs még lépcső. Adj hozzá egyet a jobb felső
                                gombbal.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
