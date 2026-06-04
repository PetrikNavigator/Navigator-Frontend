import { useState } from "react"
import type { Corridor } from "../../../types/navigator/Corridor"
import type { Building } from "../../../types/navigator/Building"

type Props = {
    buildings: Building[]
    corridors: Corridor[]
    onRemove: (c: Corridor) => void
    onEdit: (c: Corridor) => void
    onHover: (c: Corridor) => void
}

const storeyLabel = (n: number) => (n === 0 ? "Földszint" : n.toString())

export default function CorridorsTable({ corridors, buildings, onRemove, onEdit, onHover }: Props) {
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)

    const buildingName = (id: string) => {
        return buildings.find(x => x.id === id)?.name
    }

    const filteredCorridors = selectedBuildingId
        ? corridors.filter(c => c.building_id === selectedBuildingId)
        : corridors

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
                        <th>Emelet</th>
                        <th>Kezdő (x, y)</th>
                        <th>Vég (x, y)</th>
                        <th>Szélesség</th>
                        <th>Akadálym.</th>
                        <th>Kültéri</th>
                        <th className="w-40"></th>
                    </tr>
                </thead>

                <tbody>
                    {filteredCorridors.map((c) => (
                        <tr onMouseOver={() => onHover(c)}
                            className="hover:bg-base-200"
                            key={c.id.toString()}
                        >
                            <td>{c.name}</td>
                            <td>{buildingName(c.building_id)}</td>
                            <td>{storeyLabel(c.storey)}</td>
                            <td>
                                {c.x1.toFixed(1)}, {c.y1.toFixed(1)}
                            </td>
                            <td>
                                {c.x2.toFixed(1)}, {c.y2.toFixed(1)}
                            </td>
                            <td>{c.width.toFixed(1)} m</td>
                            <td>{c.barrier_free ? "Igen" : "Nem"}</td>
                            <td>{c.is_outdoor ? "Igen" : "Nem"}</td>
                            <td className="table-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => onEdit(c)}
                                >
                                    Szerk.
                                </button>
                                <button
                                    className="btn btn-error btn-sm"
                                    onClick={() => onRemove(c)}
                                >
                                    Törlés
                                </button>
                            </td>
                        </tr>
                    ))}

                    {filteredCorridors.length === 0 && (
                        <tr>
                            <td
                                colSpan={9}
                                className="text-center text-base-content/60 py-8"
                            >
                                Nincs még folyosó. Adj hozzá egyet a jobb felső
                                gombbal.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
