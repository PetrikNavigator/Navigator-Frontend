import type { ClassroomType } from "../../types/navigator/ClassroomType"

type Props = {
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
    selectedIds: string[]
    types: ClassroomType[]
}

export default function TypeHighlighter({ setSelectedIds, selectedIds, types }: Props) {

    const onClick = (t: ClassroomType) => {
        if (selectedIds.includes(t.id)) {
            const without = selectedIds.filter(x => x !== t.id)
            setSelectedIds(without)
        }
        else {
            setSelectedIds((prev: string[]) => [...prev, t.id])
        }
    }

    return (
        <div className="card bg-base-200 p-3">
            <h2 className="font-semibold mb-2 text-sm">Terem kiemelés (típus)</h2>
            <div className="flex flex-wrap gap-2 overflow-y-auto">
                {types.map((t) => {
                    const active = selectedIds.includes(t.id)
                    return (
                        <button
                            key={t.id}
                            onClick={() => onClick(t)}
                            className={`btn btn-xs ${active ? "btn-primary" : "btn-outline"}`}
                        >
                            <span
                                className="h-2 w-2 rounded-full mr-1"
                                style={{ background: t.colorhex || "#888" }}
                            />
                            {t.name}
                        </button>
                    )
                })}
            </div>
            {selectedIds.length > 0 && (
                <button
                    className="btn btn-xs mt-2 w-fit"
                    onClick={() => setSelectedIds([])}
                >
                    Kiemelés törlése
                </button>
            )}
        </div>
    )
}