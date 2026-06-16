import { useEffect, useMemo, useState } from "react"
import { useGraph } from "../../contexts/other/GraphContext"
import { SearchableDropdown } from "../SearchableDropdown"
import { searchClassrooms } from "../../utils/classroomSearch"

type NavigatePanelProps = {
    onBack: () => void
    onSelectStart: (id: string | null) => void
    onSelectEnd: (id: string) => void
    setBarrierFree: (val: boolean) => void
    barrierFree: boolean
    startId: string | null
    endId: string
    hasPos: boolean
    noRoute: boolean
    needsStart: boolean
}

type DropdownItem = {
    id: string
    name: string
}

export default function NavigatePanel({
    onBack,
    onSelectStart,
    setBarrierFree,
    startId,
    endId,
    barrierFree,
    hasPos,
    noRoute,
    needsStart

}: NavigatePanelProps) {
    const { graph, getFullGraph } = useGraph()
    const [query, setQuery] = useState("")

    useEffect(() => {
        getFullGraph()
    }, [])

    const results = searchClassrooms(graph, query)

    const dropdownItems = useMemo(() => {
        const items = [] as DropdownItem[]

        if (hasPos)
            items.push({ id: "-1", name: "Saját Pozíció" });
        
        results.forEach((x) => {
            if (x.id !== endId)
                items.push(x)
        })

        return items;
    }, [results])

    const dropdownText = useMemo(() => {
        if (!startId) {
            if (hasPos)
                return "Saját Pozíció"

            return "Válassz termet"
        }

        return dropdownItems.find(x => x.id === startId)?.name;
    }, [dropdownItems, startId])

    return (
        <div className="card bg-base-200 p-3 gap-3">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Útvonal</h2>
                <button className="btn btn-ghost btn-xs" onClick={onBack}>← Vissza</button>
            </div>

            <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: "#55ddff" }} />
                    <div className="flex space-x-2 items-center">
                        <p>Kiindulás:</p>
                        <SearchableDropdown
                            items={dropdownItems}
                            getKey={(x) => x.id}
                            getLabel={(x) => x.name}
                            onSelect={(x) => {
                                if (x!.id == "-1")
                                    onSelectStart(null)
                                else
                                    onSelectStart(x!.id)
                            }}
                            query={query}
                            setQuery={setQuery}
                            selectedKey={startId ? startId : "-1"}
                            titleButton={<button className="btn">{dropdownText}</button>}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: "#ff5577" }} />
                    <span>Cél: <b>{graph?.classrooms.find(x => x.id === endId)?.name}</b></span>
                </div>
            </div>

            <label className="label cursor-pointer justify-start gap-2">
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={barrierFree}
                    onChange={(e) => setBarrierFree(e.target.checked)}
                />
                <span className="text-sm">Akadálymentes (liftek)</span>
            </label>

            {needsStart && (
                <div className="alert alert-info py-2 text-xs">
                    <span>Válassz kiindulási pontot az útvonalhoz.</span>
                </div>
            )}
            {noRoute && (
                <div className="alert alert-warning py-2 text-xs">
                    <span>Nem található útvonal a két pont között.</span>
                </div>
            )}
        </div>
    )
}
