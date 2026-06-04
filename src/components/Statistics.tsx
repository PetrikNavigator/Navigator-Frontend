import { useLayoutEffect } from "react"
import { useBuildings } from "../contexts/navigator/BuildingContext"
import { useClassroom } from "../contexts/navigator/ClassroomContext"
import { useLifts } from "../contexts/navigator/LiftsContext"
import { useStairs } from "../contexts/navigator/StairsContext"

export default function Statistics() {
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
                    <div className="stat-title">Épületek</div>
                    <div className="stat-value">{buildings.length}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Termek</div>
                    <div className="stat-value">{classrooms.length}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Liftek</div>
                    <div className="stat-value">{lifts.length}</div>
                </div>

                <div className="stat">
                    <div className="stat-title">Lépcsők</div>
                    <div className="stat-value">{stairs.length}</div>
                </div>
            </div>
        </div>
    )
}