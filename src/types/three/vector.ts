export type Vec3 = { x: number; y: number; z: number }

export function dist(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const dz = a.z - b.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function Vec3Sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

export function Vec3Length(vec: Vec3) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
}

export function Vec3Normalize(vec: Vec3): Vec3 {
    const len = Vec3Length(vec)
    return { x: vec.x / len, y: vec.y / len, z: vec.z / len }
}

export function Vec3GetDirVector(start: Vec3, end: Vec3): Vec3 {
    const sub = Vec3Sub(end, start)
    return Vec3Normalize(sub)
}