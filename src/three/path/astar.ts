import { dist, type Vec3 } from "../../types/three/vector"

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

export class Astar {
    private nextId = 0
    private points = new Map<number, Vec3>()
    private adj = new Map<number, Set<number>>()

    findPath(start: number, goal: number): Vec3[] {
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

    addPoint(pos: Vec3): number {
        const id = this.nextId++
        this.points.set(id, pos)
        this.adj.set(id, new Set())
        return id
    }

    getPoint(id: number): Vec3 | undefined {
        return this.points.get(id)
    }

    connect(a: number, b: number): void {
        this.adj.get(a)!.add(b)
        this.adj.get(b)!.add(a)
    }
}
