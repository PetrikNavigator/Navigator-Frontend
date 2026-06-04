import { useState } from "react"
import type { Lift } from "../../../types/navigator/Lift"
import type { Building } from "../../../types/navigator/Building"

type Props = {
    buildings: Building[]
    lifts: Lift[]
    onRemove: (l: Lift) => void
    onEdit: (l: Lift) => void
    onHover: (l: Lift) => void
}

const storeyLabel = (n: number) => (n === 0 ? "Földszint" : n.toString())

export default function LiftsTable({ lifts, buildings, onRemove, onEdit, onHover }: Props) {
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)

    const buildingName = (id: string) => {
        return buildings.find(x => x.id === id)?.name
    }

    const filteredLifts = selectedBuildingId
        ? lifts.filter(l => l.building_id === selectedBuildingId)
        : lifts

    return (
        <div className="space-y-4">
            <div>
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Szűrés épület szerint</span>
                    </div>
                    <select
                        className="select select-bordered"
                        value={selectedBuildingId || ""}
                        onChange={(e) => setSelectedBuildingId(e.target.value || null)}
                    >
                        <option value="">Összes épület</option>
                        {buildings.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <table className="table table-pin-rows">
                <thead>
                    <tr>
                        <th>Név</th>
                        <th>Épület</th>
                        <th>Pozíció (x, y)</th>
                        <th>Min. emelet</th>
                        <th>Max. emelet</th>
                        <th className="w-40"></th>
                    </tr>
                </thead>

                <tbody>
                    {filteredLifts.map((l) => (
                        <tr onMouseOver={() => onHover(l)}
                            className="hover:bg-base-200"
                            key={l.id.toString()}
                        >
                            <td>{l.name}</td>
                            <td>{buildingName(l.building_id)}</td>
                            <td>
                                {l.x.toFixed(1)}, {l.y.toFixed(1)}
                            </td>
                            <td>{storeyLabel(l.min_storey)}</td>
                            <td>{storeyLabel(l.max_storey)}</td>
                            <td className="table-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => onEdit(l)}
                                >
                                    Szerk.
                                </button>
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={() => onRemove(l)}
                                >
                                    Törlés
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
                                Nincs még lift. Adj hozzá egyet a jobb felső
                                gombbal.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
