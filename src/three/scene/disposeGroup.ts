import * as THREE from "three"

// Disposes geometry on every mesh in a tree. Materials are shared via
// caches in blueprint/materials.ts — disposing them here would invalidate
// other scenes that reference them. Per-handle gizmo materials are
// handled by gizmo/disposeHandleMaterials.ts.
export function disposeGroup(g: THREE.Object3D): void {
    g.traverse(obj => {
        const mesh = obj as THREE.Mesh & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] }
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) {
            if (Array.isArray(mesh.material)) mesh.material.forEach(x => x.dispose())
            else mesh.material.dispose()
        }
    })
}
