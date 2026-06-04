import * as THREE from "three"
import type { Vec3 } from "./pathfinder"

const PATH_COLOR = 0x00ff88
const START_COLOR = 0x55ddff
const END_COLOR = 0xff5577
const TUBE_RADIUS = 0.45
const VERTICAL_LIFT = 1.5

// Renders the A* result as a smooth tube following the waypoints with
// distinct spheres at the endpoints. The whole thing is lifted slightly
// above the floor so it reads cleanly over the corridor lines.
export function buildPathOverlay(path: Vec3[]): THREE.Group {
    const group = new THREE.Group()
    if (path.length < 2) return group

    const points = path.map(p => new THREE.Vector3(p.x, p.y + VERTICAL_LIFT, p.z))

    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.25)
    const tubularSegments = Math.max(32, points.length * 12)
    const tubeGeom = new THREE.TubeGeometry(curve, tubularSegments, TUBE_RADIUS, 12, false)
    const tubeMat = new THREE.MeshBasicMaterial({
        color: PATH_COLOR,
        transparent: true,
        opacity: 0.92,
    })
    group.add(new THREE.Mesh(tubeGeom, tubeMat))

    // Faint dashed centerline along the same path — helps the eye follow
    // the route through overlapping geometry where the tube might occlude
    // itself in plan view.
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points)
    const lineMat = new THREE.LineDashedMaterial({
        color: PATH_COLOR,
        dashSize: 1.2,
        gapSize: 0.6,
        transparent: true,
        opacity: 0.5,
    })
    const line = new THREE.Line(lineGeom, lineMat)
    line.computeLineDistances()
    group.add(line)

    group.add(makeMarker(points[0], START_COLOR))
    group.add(makeMarker(points[points.length - 1], END_COLOR))

    return group
}

function makeMarker(at: THREE.Vector3, color: number): THREE.Mesh {
    const geom = new THREE.SphereGeometry(1.1, 16, 12)
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
    const m = new THREE.Mesh(geom, mat)
    m.position.copy(at)
    return m
}
