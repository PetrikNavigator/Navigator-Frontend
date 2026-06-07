import type { FullGraph } from "../../types/FullGraph"
import type { Building } from "../../types/navigator/Building"
import type { Classroom } from "../../types/navigator/Classroom"
import type { Corridor } from "../../types/navigator/Corridor"
import { dist, type Vec3 } from "../../types/three/vector"
import { floorPositionOf } from "../entities/buildingHelpers"
import type { Lift } from "../../types/navigator/Lift"
import type { Stair } from "../../types/navigator/Stair"
import { Astar } from "./astar"
import { corridorsIntersect } from "../entities/corridorHelper"

type Connector = (Lift | Stair) & { isLift: boolean }

const CLASSROOM_CONNECTION_THRESHOLD = 15
const CORRIDOR_POINTS = 2

export class GraphPathBuilder {
    private graph: FullGraph
    private barrierFree: boolean

    private pointIdToClassroom = new Map<number, Classroom>()
    private pointIdToCorridor = new Map<number, Corridor>()
    private pointIdToStoreyConnector = new Map<
        number,
        { connector: Connector; storey: number }
    >()

    private corridorIdToPoints = new Map<string, number[]>()
    private classroomIdToPoint = new Map<string, number>()

    private astar = new Astar()

    constructor(graph: FullGraph, barrierFree: boolean) {
        this.graph = graph
        this.barrierFree = barrierFree
        this.build()
    }

    getAstar(): Astar {
        return this.astar
    }

    getPath(fromClassroomId: string, toClassroomId: string, isBarrierFree: boolean): Vec3[] {
        if (this.barrierFree !== isBarrierFree) {
            this.barrierFree = isBarrierFree
            this.build()
        }

        const start = this.classroomIdToPoint.get(fromClassroomId)
        const end = this.classroomIdToPoint.get(toClassroomId)

        if (start === undefined || end === undefined) return [];

        return this.astar.findPath(start, end)
    }

    private build(): void {
        this.pointIdToClassroom = new Map<number, Classroom>()
        this.pointIdToCorridor = new Map<number, Corridor>()
        this.pointIdToStoreyConnector = new Map<
            number,
            { connector: Connector; storey: number }
        >()

        this.corridorIdToPoints = new Map<string, number[]>()
        this.classroomIdToPoint = new Map<string, number>()

        this.astar = new Astar()

        this.buildClassroomPoints()
        this.buildCorridorPoints()
        this.connectCorridors()
        this.connectClassroomsToCorridors()
        this.buildStoreyConnectorPoints()
    }

    private buildClassroomPoints() {
        for (const c of this.graph.classrooms) {
            const id = this.astar.addPoint(this.classroomDoorPos(c))
            this.pointIdToClassroom.set(id, c)
            this.classroomIdToPoint.set(c.id, id)
        }
    }

    private buildCorridorPoints() {
        for (const cor of this.graph.corridors) {
            const points = this.getCorridorPoints(cor)

            let prevId = -1
            let currId = -1
            for (let i = 0; i < points.length; i++) {
                currId = this.astar.addPoint(points[i])

                this.pointIdToCorridor.set(currId, cor)

                const corToP = this.corridorIdToPoints.get(cor.id) || []
                corToP.push(currId)
                this.corridorIdToPoints.set(cor.id, corToP)

                if (prevId >= 0) {
                    this.astar.connect(prevId, currId)
                }

                prevId = currId
            }
        }
    }

    private connectCorridors() {
        for (let i = 0; i < this.graph.corridors.length; i++) {
            const corA = this.graph.corridors[i]

            for (let j = i + 1; j < this.graph.corridors.length; j++) {
                const corB = this.graph.corridors[j]

                if (corA.storey !== corB.storey)
                    continue

                if (this.barrierFree && !corB.barrier_free)
                    continue

                if (!corridorsIntersect(corA, corB, this.graph.buildings))
                    continue

                let closestDistSq = Infinity
                let closestA = -1
                let closestB = -1

                for (const idA of this.corridorIdToPoints.get(corA.id)!) {
                    const pA = this.astar.getPoint(idA)!

                    for (const idB of this.corridorIdToPoints.get(corB.id)!) {
                        const pB = this.astar.getPoint(idB)!

                        const dx = pA.x - pB.x
                        const dy = pA.z - pB.z
                        const distSq = dx * dx + dy * dy

                        if (distSq < closestDistSq) {
                            closestDistSq = distSq
                            closestA = idA
                            closestB = idB
                        }
                    }
                }

                if (closestA > -1 && closestB > -1) {
                    this.astar.connect(closestA, closestB)
                }
            }
        }
    }

    private connectClassroomsToCorridors() {
        for (const c of this.graph.classrooms) {
            const classroomPointId = this.classroomIdToPoint.get(c.id)!
            const classroomPos = this.astar.getPoint(classroomPointId)!

            let closestId = -1
            let closestDist = Infinity

            for (const cor of this.graph.corridors) {
                if (cor.storey !== c.storey || cor.building_id !== c.building_id) continue
                if (cor.is_outdoor) continue
                const pts = this.corridorIdToPoints.get(cor.id)

                if (!pts) continue

                for (const pid of pts) {
                    const d = dist(classroomPos, this.astar.getPoint(pid)!)

                    if (d > CLASSROOM_CONNECTION_THRESHOLD)
                        continue

                    if (d < closestDist) {
                        closestDist = d
                        closestId = pid
                    }
                }
            }

            if (closestId !== -1) this.astar.connect(classroomPointId, closestId)
        }
    }

    private buildStoreyConnectorPoints() {
        const allConnectors: Connector[] = this.barrierFree
            ? this.graph.lifts.map(l => ({ ...l, isLift: true }))
            : this.graph.stairs.map(s => ({ ...s, isLift: false }))

        const connectorStoreyPoints = new Map<string, Map<number, number>>()

        for (const connector of allConnectors) {
            const storeyMap = new Map<number, number>()
            for (let storey = connector.min_storey; storey <= connector.max_storey; storey++) {
                const pos = this.connectorPosOnStorey(connector, storey)
                const id = this.astar.addPoint(pos)
                this.pointIdToStoreyConnector.set(id, { connector, storey })
                storeyMap.set(storey, id)
            }
            connectorStoreyPoints.set(connector.id, storeyMap)

            const storeys = [...storeyMap.keys()].sort((a, b) => a - b)
            for (let k = 0; k < storeys.length - 1; k++) {
                this.astar.connect(storeyMap.get(storeys[k])!, storeyMap.get(storeys[k + 1])!)
            }
        }

        for (const connector of allConnectors) {
            const storeyMap = connectorStoreyPoints.get(connector.id)!
            for (const [storey, connectorPoint] of storeyMap) {
                const connectorPos = this.astar.getPoint(connectorPoint)!

                let closestId = -1
                let closestDist = Infinity
                for (const cor of this.graph.corridors) {
                    if (cor.storey !== storey || cor.building_id !== connector.building_id) continue

                    const pts = this.corridorIdToPoints.get(cor.id)!

                    if (!pts) continue

                    for (const pid of pts) {
                        const d = dist(connectorPos, this.astar.getPoint(pid)!)
                        if (d < closestDist) {
                            closestDist = d
                            closestId = pid
                        }
                    }
                }

                if (closestId !== -1)
                    this.astar.connect(connectorPoint, closestId)
            }
        }
    }





    private getBuilding(id: string): Building {
        const b = this.graph.buildings.find(x => x.id === id)
        if (!b) throw new Error(`Building ${id} not found`)
        return b
    }

    private classroomDoorPos(c: Classroom): Vec3 {
        const building = this.getBuilding(c.building_id)
        const rad = (c.rotation * Math.PI) / 180
        // Vector2(0,1).rotated(rad) — same formula as `Classroom.GetDoorOffset`.
        const offX = -Math.sin(rad) * (c.size_y / 2)
        const offY = Math.cos(rad) * (c.size_y / 2)
        const x = c.x + building.x + offX
        const z = c.y + building.y + offY
        const y = floorPositionOf(this.graph, c.building_id, c.storey)
        return { x, y, z }
    }

    private corridorStartPos(cor: Corridor): Vec3 {
        const building = this.getBuilding(cor.building_id)
        return {
            x: building.x + cor.x1,
            y: floorPositionOf(this.graph, cor.building_id, cor.storey),
            z: building.y + cor.y1,
        }
    }

    private corridorEndPos(cor: Corridor): Vec3 {
        const building = this.getBuilding(cor.building_id)
        return {
            x: building.x + cor.x2,
            y: floorPositionOf(this.graph, cor.building_id, cor.storey),
            z: building.y + cor.y2,
        }
    }

    private getCorridorPoints(cor: Corridor): Vec3[] {
        const out: Vec3[] = []
        const startPoint = this.corridorStartPos(cor)
        const endPoint = this.corridorEndPos(cor)
        const floorPos = floorPositionOf(this.graph, cor.building_id, cor.storey)
        const length = dist(startPoint, endPoint)

        if (length < 0.01)
            return [startPoint]

        const step = Math.min(
            1,
            (10 / CORRIDOR_POINTS) / length
        )

        for (let t = 0; t < 1; t += step) {
            const x = startPoint.x + (endPoint.x - startPoint.x) * t;
            const z = startPoint.z + (endPoint.z - startPoint.z) * t;

            out.push({ x, y: floorPos, z })
        }

        out.push({ x: endPoint.x, y: floorPos, z: endPoint.z })

        return out
    }

    private connectorPosOnStorey(c: Connector, storey: number): Vec3 {
        const building = this.getBuilding(c.building_id)
        let x = c.x + building.x
        return {
            x,
            y: floorPositionOf(this.graph, c.building_id, storey),
            z: c.y + building.y,
        }
    }
}