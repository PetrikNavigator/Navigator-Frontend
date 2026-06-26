import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
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
    const { t } = useTranslation()
    const { graph, getFullGraph } = useGraph()
    const [query, setQuery] = useState("")

    useEffect(() => {
        getFullGraph()
    }, [])

    const results = searchClassrooms(graph, query, t)

    // The synthetic "my position" item carries already-translated text; real
    // classroom items carry a codename in `name` that is translated at render.
    const POS_ID = "-1"

    const dropdownItems = useMemo(() => {
        const items = [] as DropdownItem[]

        if (hasPos)
            items.push({ id: POS_ID, name: t("ui.navigate.my_position") });

        results.forEach((x) => {
            if (x.id !== endId)
                items.push(x)
        })

        return items;
    }, [results])

    const labelOf = (item: DropdownItem) =>
        item.id === POS_ID ? item.name : t(item.name)

    const dropdownText = useMemo(() => {
        if (!startId) {
            if (hasPos)
                return t("ui.navigate.my_position")

            return t("ui.navigate.choose_room")
        }

        const item = dropdownItems.find(x => x.id === startId)
        return item ? labelOf(item) : ""
    }, [dropdownItems, startId])

    return (
        <div className="card bg-base-200 p-3 gap-3">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">{t("ui.navigate.title")}</h2>
                <button className="btn btn-ghost btn-xs" onClick={onBack}>{t("ui.navigate.back")}</button>
            </div>

            <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: "#55ddff" }} />
                    <div className="flex space-x-2 items-center">
                        <p>{t("ui.navigate.start")}</p>
                        <SearchableDropdown
                            items={dropdownItems}
                            getKey={(x) => x.id}
                            getLabel={labelOf}
                            onSelect={(x) => {
                                if (x!.id == POS_ID)
                                    onSelectStart(null)
                                else
                                    onSelectStart(x!.id)
                            }}
                            query={query}
                            setQuery={setQuery}
                            selectedKey={startId ? startId : POS_ID}
                            titleButton={<button className="btn">{dropdownText}</button>}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: "#ff5577" }} />
                    <span>{t("ui.navigate.destination")} <b>{t(graph?.classrooms.find(x => x.id === endId)?.name ?? "")}</b></span>
                </div>
            </div>

            <label className="label cursor-pointer justify-start gap-2">
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={barrierFree}
                    onChange={(e) => setBarrierFree(e.target.checked)}
                />
                <span className="text-sm">{t("ui.navigate.barrier_free")}</span>
            </label>

            {needsStart && (
                <div className="alert alert-info py-2 text-xs">
                    <span>{t("ui.navigate.needs_start")}</span>
                </div>
            )}
            {noRoute && (
                <div className="alert alert-warning py-2 text-xs">
                    <span>{t("ui.navigate.no_route")}</span>
                </div>
            )}
        </div>
    )
}
