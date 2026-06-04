import { useLayoutEffect, useState } from "react";
import BuildingEditorModal from "./BuildingEditorModal";
import type { Building } from "../../../types/navigator/Building";
import { useBuildings } from "../../../contexts/navigator/BuildingContext";

export default function BuildingsTable() {
    const { buildings, getBuildings, deleteBuilding } = useBuildings()

    const [editing, setEditing] = useState<Building | null>(null)
    const [open, setOpen] = useState(false)

    const onRemove = async (building: Building) => {
        const res = confirm(`Biztos hogy törölöd a(z) ${building.name}?`)
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
                        Épület hozzáadása
                    </button>
                    <div className="overflow-x-auto max-h-[80vh]">
                        <table className="table table-pin-rows">
                            <thead>
                                <tr>
                                    <th>Név</th>
                                    <th>Leírás</th>
                                    <th className="w-32"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {buildings.map((b) => (
                                    <tr
                                        key={b.id.toString()}
                                    >
                                        <td className="font-medium">{b.name}</td>

                                        <td>{b.description || "—"}</td>

                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => onEdit(b)}
                                                >
                                                    Szerk.
                                                </button>

                                                <button
                                                    className="btn btn-error btn-sm"
                                                    onClick={() => onRemove(b)}
                                                >
                                                    Törlés
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
                                            Nincs még épület. Adj hozzá egyet a jobb felső
                                            gombbal.
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