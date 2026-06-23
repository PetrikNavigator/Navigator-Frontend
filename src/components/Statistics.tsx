import { useLayoutEffect } from "react"
import { useTranslation } from "react-i18next"
import { useBuildings } from "../contexts/navigator/BuildingContext"
import { useClassroom } from "../contexts/navigator/ClassroomContext"
import { useLifts } from "../contexts/navigator/LiftsContext"
import { useStairs } from "../contexts/navigator/StairsContext"

export default function Statistics() {
    const { t } = useTranslation()
    const { buildings, getBuildings } = useBuildings()
    const { classrooms, getClassrooms } = useClassroom()
    const { lifts, getLifts } = useLifts()
    const { stairs, getStairs } = useStairs()

    useLayoutEffect(() => {
        getBuildings()
        getClassrooms()
        getLifts()
        getStairs()
    }, [])

    return (
        <div className="max-w-192 mx-auto">
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                    <div className="stat-title">{t("ui.sidebar.buildings")}</div>
                    <div className="stat-value">{buildings.length}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">{t("ui.sidebar.classrooms")}</div>
                    <div className="stat-value">{classrooms.length}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">{t("ui.sidebar.lifts")}</div>
                    <div className="stat-value">{lifts.length}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">{t("ui.sidebar.stairs")}</div>
                    <div className="stat-value">{stairs.length}</div>
                </div>
            </div>
        </div>
    )
}
