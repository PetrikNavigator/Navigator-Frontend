import type { FullGraph } from "../../types/FullGraph"
import type { Building } from "../../types/navigator/Building"
import type { Classroom } from "../../types/navigator/Classroom"
import type { Corridor } from "../../types/navigator/Corridor"
import type { Lift } from "../../types/navigator/Lift"
import type { Stair } from "../../types/navigator/Stair"
import { floorPositionOf } from "../entities/building/buildingHelpers"

// Mirrors `_rebuild_path_finder` in petrik-navigator-client/scripts/pathfinder.gd:
// builds the same set of points (classroom doors, corridor endpoints,
// per-storey connector stops) and the same connections (corridor internal
// segments, near-endpoint corridor-to-corridor links, classroom-to-nearest
// corridor-endpoint, vertical connector stacks, connector-to-corridor on
// the matching storey). Then runs A* over that graph.

export type Vec3 = { x: number; y: number; z: number }

type Connector = (Lift | Stair) & { isLift: boolean }

const CONNECTION_THRESHOLD = 30

function dist(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const dz = a.z - b.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

// Min-heap keyed on numeric priority. Just enough for A*.
class MinHeap<T> {
    private data: { key: number; value: T }[] = []

    push(key: number, value: T): void {
        this.data.push({ key, value })
        this.bubbleUp(this.data.length - 1)
    }

    pop(): T | undefined {
        if (this.data.length === 0) return undefined
        const top = this.data[0]
        const last = this.data.pop()!
        if (this.data.length > 0) {
            this.data[0] = last
            this.sinkDown(0)
        }
        return top.value
    }

    get size(): number { return this.data.length }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1
            if (this.data[parent].key <= this.data[i].key) break
            const tmp = this.data[parent]
            this.data[parent] = this.data[i]
            this.data[i] = tmp
            i = parent
        }
    }

    private sinkDown(i: number): void {
        const n = this.data.length
        while (true) {
            const l = i * 2 + 1
            const r = i * 2 + 2
            let smallest = i
            if (l < n && this.data[l].key < this.data[smallest].key) smallest = l
            if (r < n && this.data[r].key < this.data[smallest].key) smallest = r
            if (smallest === i) break
            const tmp = this.data[smallest]
            this.data[smallest] = this.data[i]
            this.data[i] = tmp
            i = smallest
        }
    }
}

export class Pathfinder {
    private graph: FullGraph
    private barrierFree: boolean

    private nextId = 0
    private points = new Map<number, Vec3>()
    private adj = new Map<number, Set<number>>()

    private pointIdToClassroom = new Map<number, Classroom>()
    private pointIdToCorridor = new Map<number, Corridor>()
    private pointIdToStoreyConnector = new Map<
        number,
        { connector: Connector; storey: number }
    >()

    private corridorIdToPoints = new Map<string, [number, number]>()
    private classroomIdToPoint = new Map<string, number>()

    constructor(graph: FullGraph, barrierFree: boolean) {
        this.graph = graph
        this.barrierFree = barrierFree
        this.build()
    }

    findPath(fromClassroomId: string, toClassroomId: string): Vec3[] {
        const start = this.classroomIdToPoint.get(fromClassroomId.toString())
        const goal = this.classroomIdToPoint.get(toClassroomId.toString())
        if (start === undefined || goal === undefined) return []
        if (start === goal) return [this.points.get(start)!]

        const goalPos = this.points.get(goal)!

        const gScore = new Map<number, number>()
        const cameFrom = new Map<number, number>()
        const open = new MinHeap<number>()

        gScore.set(start, 0)
        open.push(dist(this.points.get(start)!, goalPos), start)

        while (open.size > 0) {
            const current = open.pop()!
            if (current === goal) return this.reconstruct(cameFrom, current)

            const curPos = this.points.get(current)!
            const curG = gScore.get(current)!

            for (const neighbor of this.adj.get(current) ?? new Set<number>()) {
                const neiPos = this.points.get(neighbor)!
                const tentative = curG + dist(curPos, neiPos)
                const existing = gScore.get(neighbor)
                if (existing === undefined || tentative < existing) {
                    gScore.set(neighbor, tentative)
                    cameFrom.set(neighbor, current)
                    open.push(tentative + dist(neiPos, goalPos), neighbor)
                }
            }
        }

        return []
    }

    private reconstruct(cameFrom: Map<number, number>, end: number): Vec3[] {
        const ids: number[] = [end]
        let cur = end
        while (cameFrom.has(cur)) {
            cur = cameFrom.get(cur)!
            ids.push(cur)
        }
        ids.reverse()
        return ids.map(id => this.points.get(id)!)
    }

    private addPoint(pos: Vec3): number {
        const id = this.nextId++
        this.points.set(id, pos)
        this.adj.set(id, new Set())
        return id
    }

    private connect(a: number, b: number): void {
        this.adj.get(a)!.add(b)
        this.adj.get(b)!.add(a)
    }

    private build(): void {
        const graph = this.graph

        // 1. Classroom door points.
        for (const c of graph.classrooms) {
            const id = this.addPoint(this.classroomDoorPos(c))
            this.pointIdToClassroom.set(id, c)
            this.classroomIdToPoint.set(c.id.toString(), id)
        }

        // 2. Corridor endpoint points + internal segment.
        for (const cor of graph.corridors) {
            const startId = this.addPoint(this.corridorStartPos(cor))
            const endId = this.addPoint(this.corridorEndPos(cor))
            this.pointIdToCorridor.set(startId, cor)
            this.pointIdToCorridor.set(endId, cor)
            this.corridorIdToPoints.set(cor.id.toString(), [startId, endId])
            this.connect(startId, endId)
        }

        // 3. Corridor-to-corridor links by spatial proximity (same storey,
        //    first matching endpoint pair within threshold).
        const corridors = graph.corridors
        for (let i = 0; i < corridors.length; i++) {
            const corA = corridors[i]
            const ptsA = this.corridorIdToPoints.get(corA.id.toString())!
            for (let j = i + 1; j < corridors.length; j++) {
                const corB = corridors[j]
                if (corA.storey !== corB.storey) continue
                const ptsB = this.corridorIdToPoints.get(corB.id.toString())!

                const posA0 = this.points.get(ptsA[0])!
                const posA1 = this.points.get(ptsA[1])!
                const posB0 = this.points.get(ptsB[0])!
                const posB1 = this.points.get(ptsB[1])!

                if (dist(posA0, posB0) < CONNECTION_THRESHOLD) {
                    this.connect(ptsA[0], ptsB[0])
                } else if (dist(posA0, posB1) < CONNECTION_THRESHOLD) {
                    this.connect(ptsA[0], ptsB[1])
                } else if (dist(posA1, posB0) < CONNECTION_THRESHOLD) {
                    this.connect(ptsA[1], ptsB[0])
                } else if (dist(posA1, posB1) < CONNECTION_THRESHOLD) {
                    this.connect(ptsA[1], ptsB[1])
                }
            }
        }

        // 4. Connect each classroom to its closest same-building/same-storey
        //    corridor endpoint.
        for (const c of graph.classrooms) {
            const classroomPointId = this.classroomIdToPoint.get(c.id.toString())!
            const classroomPos = this.points.get(classroomPointId)!

            let closestId = -1
            let closestDist = Infinity

            for (const cor of graph.corridors) {
                if (cor.storey !== c.storey || cor.building_id !== c.building_id) continue
                const pts = this.corridorIdToPoints.get(cor.id.toString())
                if (!pts) continue
                for (const pid of pts) {
                    const d = dist(classroomPos, this.points.get(pid)!)
                    if (d < closestDist) {
                        closestDist = d
                        closestId = pid
                    }
                }
            }

            if (closestId !== -1) this.connect(classroomPointId, closestId)
        }

        // 5. Storey connectors — lifts if barrier-free, otherwise stairs.
        //    Adds a point per served storey and links them vertically.
        const allConnectors: Connector[] = this.barrierFree
            ? graph.lifts.map(l => ({ ...l, isLift: true }))
            : graph.stairs.map(s => ({ ...s, isLift: false }))

        const connectorStoreyPoints = new Map<string, Map<number, number>>()

        for (const connector of allConnectors) {
            const storeyMap = new Map<number, number>()
            for (let storey = connector.min_storey; storey <= connector.max_storey; storey++) {
                const pos = this.connectorPosOnStorey(connector, storey)
                const id = this.addPoint(pos)
                this.pointIdToStoreyConnector.set(id, { connector, storey })
                storeyMap.set(storey, id)
            }
            connectorStoreyPoints.set(connector.id.toString(), storeyMap)

            const storeys = [...storeyMap.keys()].sort((a, b) => a - b)
            for (let k = 0; k < storeys.length - 1; k++) {
                this.connect(storeyMap.get(storeys[k])!, storeyMap.get(storeys[k + 1])!)
            }
        }

        // 6. Connect each connector storey-point to the nearer endpoint of
        //    every same-building, same-storey corridor.
        for (const connector of allConnectors) {
            const storeyMap = connectorStoreyPoints.get(connector.id.toString())!
            for (const [storey, connectorPoint] of storeyMap) {
                const connectorPos = this.points.get(connectorPoint)!

                for (const cor of graph.corridors) {
                    if (cor.storey !== storey || cor.building_id !== connector.building_id) continue
                    const pts = this.corridorIdToPoints.get(cor.id.toString())!
                    const dStart = dist(connectorPos, this.points.get(pts[0])!)
                    const dEnd = dist(connectorPos, this.points.get(pts[1])!)
                    const target = dStart < dEnd ? pts[0] : pts[1]
                    this.connect(connectorPoint, target)
                }
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
