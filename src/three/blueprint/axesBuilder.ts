import * as THREE from "three"

type Disposable = { dispose: () => void }

export type AxesHelperHandle = {
    objects: THREE.Object3D[]
    dispose: () => void
}

const AXIS_LENGTH = 200

function makeAxisLine(
    color: number,
    start: THREE.Vector3,
    end: THREE.Vector3,
): { line: THREE.Line; dispose: () => void } {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        depthTest: false,
    })
    const line = new THREE.Line(geometry, material)
    line.renderOrder = 999
    return {
        line,
        dispose: () => {
            geometry.dispose()
            material.dispose()
        },
    }
}

function makeAxisLabel(
    text: string,
    color: string,
    position: THREE.Vector3,
): { sprite: THREE.Sprite; dispose: () => void } {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")!
    ctx.font = "bold 96px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = color
    ctx.fillText(text, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(material)
    sprite.position.copy(position)
    sprite.scale.set(8, 8, 1)
    sprite.renderOrder = 1000
    return {
        sprite,
        dispose: () => {
            texture.dispose()
            material.dispose()
        },
    }
}

function makeGrid(): { grid: THREE.GridHelper; dispose: () => void } {
    const grid = new THREE.GridHelper(AXIS_LENGTH * 2, 40, 0x666666, 0x333333)
    const mat = grid.material as THREE.Material
    mat.transparent = true
    mat.opacity = 0.35
    return {
        grid,
        dispose: () => {
            grid.geometry.dispose()
            mat.dispose()
        },
    }
}

export function buildAxes(): AxesHelperHandle {
    const group = new THREE.Group()
    const resources: Disposable[] = []

    const axes: Array<{ color: number; from: THREE.Vector3; to: THREE.Vector3 }> = [
        { color: 0xff5050, from: new THREE.Vector3(-AXIS_LENGTH, 0, 0), to: new THREE.Vector3(AXIS_LENGTH, 0, 0) },
        { color: 0x50e050, from: new THREE.Vector3(0, -AXIS_LENGTH, 0), to: new THREE.Vector3(0, AXIS_LENGTH, 0) },
        { color: 0x6090ff, from: new THREE.Vector3(0, 0, -AXIS_LENGTH), to: new THREE.Vector3(0, 0, AXIS_LENGTH) },
    ]
    for (const a of axes) {
        const { line, dispose } = makeAxisLine(a.color, a.from, a.to)
        group.add(line)
        resources.push({ dispose })
    }

    const labels: Array<{ text: string; color: string; pos: THREE.Vector3 }> = [
        { text: "X", color: "#ff5050", pos: new THREE.Vector3(AXIS_LENGTH + 5, 0, 0) },
        { text: "Y", color: "#50e050", pos: new THREE.Vector3(0, AXIS_LENGTH + 5, 0) },
        { text: "Z", color: "#6090ff", pos: new THREE.Vector3(0, 0, AXIS_LENGTH + 5) },
    ]
    for (const l of labels) {
        const { sprite, dispose } = makeAxisLabel(l.text, l.color, l.pos)
        group.add(sprite)
        resources.push({ dispose })
    }

    const { grid, dispose: gridDispose } = makeGrid()
    resources.push({ dispose: gridDispose })

    return {
        objects: [group, grid],
        dispose: () => resources.forEach((r) => r.dispose()),
    }
}
