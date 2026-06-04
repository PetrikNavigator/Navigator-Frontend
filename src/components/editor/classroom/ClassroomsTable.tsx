import { useState } from "react"
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
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)

    const buildingName = (id: string) => {
        return buildings.find(x => x.id === id)?.name
    }

    const filteredClassrooms = selectedBuildingId
        ? classrooms.filter(c => c.building_id === selectedBuildingId)
        : classrooms

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
                        <th>Befogadóképesség</th>
                        <th className="w-40"></th>
                    </tr>
                </thead>

                <tbody>
                    {filteredClassrooms.map((c) => (
                        <tr onMouseOver={() => onHover(c)}
                            className="hover:bg-base-200"
                            key={c.id.toString()}
                        >
                            <td>{c.name}</td>
                            <td>{buildingName(c.building_id)}</td>
                            <td>{c.storey === 0 ? "Földszint" : c.storey}</td>
                            <td>{c.capacity}</td>
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

                    {filteredClassrooms.length === 0 && (
                        <tr>
                            <td
                                colSpan={4}
                                className="text-center text-base-content/60 py-8"
                            >
                                Nincs még terem. Adj hozzá egyet a jobb felső
                                gombbal.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}