import { useEffect, useMemo, useRef, useState } from "react"
import { useGraph } from "../../contexts/other/GraphContext"
import { classroomInfo, searchClassrooms } from "../../utils/classroomSearch"

type Props = {
    onSelect: (id: string) => void
    onNavigate: (id: string) => void
    selectedId: string | null
    resetToken: number
}

export default function SearchPanel({ onSelect, selectedId, onNavigate, resetToken }: Props) {
    const { graph, getFullGraph } = useGraph()

    const [query, setQuery] = useState("")

    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

    useEffect(() => {
        getFullGraph()
    }, [])

    useEffect(() => {
        setQuery("")
    }, [resetToken])

    useEffect(() => {
        if (!selectedId) return

        const id = requestAnimationFrame(() => {
            itemRefs.current[selectedId]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            })
        })

        return () => cancelAnimationFrame(id)
    }, [selectedId])

    const results = useMemo(
        () => searchClassrooms(graph, query),
        [graph, query],
    )

    if (!graph)
        return

    return (
        <>
            <div className="card bg-base-200 p-3 gap-2">
                <label className="input input-bordered flex items-center w-full gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                    </svg>
                    <input
                        type="text"
                        className="grow"
                        placeholder="Terem keresése"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {query && (
                        <button className="btn btn-ghost btn-xs" onClick={() => setQuery("")}>✕</button>
                    )}
                </label>
                <div className="overflow-y-auto max-h-80 my-4 space-y-4">
                    {
                        results.map(x => {
                            const info = classroomInfo(graph, x)

                            return (
                                <div
                                    ref={(el) => {
                                        itemRefs.current[x.id] = el
                                    }}
                                    onClick={() => onSelect(x.id)}
                                    className={`card ${x.id === selectedId ? "bg-primary/50" : "bg-base-300"} p-3 gap-1 cursor-pointer`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h2 className="font-bold text-lg">{x.name}</h2>
                                            <div className="flex items-center gap-1 text-sm opacity-80">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ background: info.typeColor }}
                                                />
                                                {info.floorLabel}
                                            </div>
                                        </div>
                                        {
                                            x.id === selectedId &&
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onNavigate(x.id)
                                                }}
                                            >
                                                Navigálás →
                                            </button>
                                        }
                                    </div>
                                    <div className="text-sm mt-1">
                                        <div className="flex items-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
                                                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                                            </svg>
                                            <p>{info.buildingName} - {info.floorLabel}</p>
                                        </div>
                                        {info.classroom.description && (
                                            <p className="mt-1 opacity-80">{info.classroom.description}</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}