import { useTranslation } from "react-i18next"
import type { ClassroomType } from "../../types/navigator/ClassroomType"

type Props = {
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
    selectedIds: string[]
    types: ClassroomType[]
}

export default function TypeHighlighter({ setSelectedIds, selectedIds, types }: Props) {
    const { t } = useTranslation()

    const onClick = (type: ClassroomType) => {
        if (selectedIds.includes(type.id)) {
            const without = selectedIds.filter(x => x !== type.id)
            setSelectedIds(without)
        }
        else {
            setSelectedIds((prev: string[]) => [...prev, type.id])
        }
    }

    return (
        <div className="card bg-base-200 p-3 min-h-0 overflow-hidden">
            <h2 className="font-semibold mb-2 text-sm">
                {t("ui.highlighter.title")}
            </h2>

            <div className="flex flex-wrap gap-2 overflow-y-auto">
                {types.map((type) => {
                    const active = selectedIds.includes(type.id)

                    return (
                        <button
                            key={type.id}
                            onClick={() => onClick(type)}
                            className={`btn btn-xs ${active ? "btn-primary" : "btn-outline"}`}
                        >
                            <span
                                className="h-2 w-2 rounded-full mr-1"
                                style={{ background: type.colorhex || "#888" }}
                            />
                            {t(type.name)}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
