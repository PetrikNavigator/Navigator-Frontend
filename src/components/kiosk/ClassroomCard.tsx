import { useLayoutEffect, useRef, useState } from "react"
import type { Classroom } from "../../types/navigator/Classroom"
import type { ClassroomInfo } from "../../utils/classroomSearch"

type ClassroomCardProp = {
    x: Classroom
    info: ClassroomInfo,
    selectedId: string | null,
    onSelect: (id: string) => void,
    onNavigate: (id: string) => void,
    itemRefs: React.RefObject<Record<string, HTMLDivElement | null>>,
}

export default function ClassroomCard({
    x,
    info,
    selectedId,
    onSelect,
    onNavigate,
    itemRefs,
}: ClassroomCardProp) {
    const [expanded, setExpanded] = useState(false)

    const textRef = useRef<HTMLParagraphElement | null>(null)
    const [isOverflowing, setIsOverflowing] = useState(false)

    useLayoutEffect(() => {
        const el = textRef.current
        if (!el) return

        const check = () => {
            setIsOverflowing(el.scrollHeight > el.clientHeight)
        }

        check()

        const ro = new ResizeObserver(check)
        ro.observe(el)

        return () => ro.disconnect()
    }, [info.classroom.description, expanded])

    return (
        <div
            ref={(el) => {
                itemRefs.current[x.id] = el
            }}
            onClick={() => onSelect(x.id)}
            className={`card ${x.id === selectedId ? "bg-primary/50" : "bg-base-300"
                } p-3 gap-1 cursor-pointer`}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="font-bold text-lg">{x.name}</h2>

                    <div className="flex items-center gap-1 text-sm opacity-80">
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: info.typeColor }}
                        />
                        {info.typeName}
                    </div>
                </div>

                {x.id === selectedId && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            onNavigate(x.id)
                        }}
                    >
                        Navigálás →
                    </button>
                )}
            </div>

            <div className="text-sm mt-1">
                <div className="flex items-center space-x-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
                        <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg>

                    <p>
                        {info.buildingName} - {info.floorLabel}
                    </p>
                </div>

                {info.classroom.description && (
                    <div>
                        <p ref={textRef} className={`opacity-80 ${expanded ? "" : "line-clamp-2"}`}>
                            {info.classroom.description}
                        </p>
                    </div>
                )}
            </div>

            {
                info.classroom.description && (isOverflowing || expanded) && (
                    <div className="card-actions">
                        <button
                            className="btn btn-ghost btn-xs"
                            onClick={(e) => {
                                e.stopPropagation()
                                setExpanded((v) => !v)
                            }}
                        >
                            {expanded ? "Kevesebb" : "Több"}
                        </button>
                    </div>
                )
            }
        </div>
    )
}