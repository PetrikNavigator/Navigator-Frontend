import { useEffect, useMemo, useRef, useState } from "react"
import { useGraph } from "../../contexts/other/GraphContext"
import { classroomInfo, searchClassrooms } from "../../utils/classroomSearch"
import ClassroomCard from "./ClassroomCard"

type Props = {
    onSelect: (id: string) => void
    onNavigate: (id: string) => void
    selectedId: string | null
    resetToken: number
    selectedTypeIds: string[]
}

export default function SearchPanel({ onSelect, selectedId, onNavigate, resetToken, selectedTypeIds }: Props) {
    const { graph, getFullGraph } = useGraph()

    const [query, setQuery] = useState("")

    const inputRef = useRef<HTMLInputElement>(null)
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

    useEffect(() => {
        getFullGraph()
    }, [])

    useEffect(() => {
        setQuery("")
        inputRef.current?.blur()
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

    const results = useMemo(() => {
        const result = searchClassrooms(graph, query)

        if (selectedTypeIds.length == 0)
            return result;

        return result.filter(x => selectedTypeIds.includes(x.type_id))
    }, [graph, query, selectedTypeIds])

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
                        ref={inputRef}
                        type="text"
                        className="grow"
                        placeholder="Terem keresése"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button className="btn btn-ghost btn-xs" onClick={() => setQuery("")}>✕</button>
                    )}
                </label>
                <div className="overflow-y-auto max-h-96 my-4 space-y-4">
                    {
                        results.map(x => {
                            const info = classroomInfo(graph, x)

                            return (<ClassroomCard key={x.id} info={info} x={x} itemRefs={itemRefs} onNavigate={onNavigate} onSelect={onSelect} selectedId={selectedId} />)
                        })
                    }
                </div>
            </div>
        </>
    )
}