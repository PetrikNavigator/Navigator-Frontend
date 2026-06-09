/** The user's saved "you are here" position. `x`/`y` are in the same
 *  un-centered world frame as `building.x + entity.x` (so they line up
 *  with the pathfinder's coordinate space); `storey` selects the floor. */
export type MyLocation = {
    x: number
    y: number
    storey: number
    buildingId: string
}

/** localStorage key the location is persisted under. */
export const MY_LOCATION_KEY = "myLocation"

/** Read the saved location (or null if unset / malformed). Tolerates the
 *  legacy `{x, y}` shape by defaulting the storey to 0. */
export function loadMyLocation(): MyLocation | null {
    const raw = localStorage.getItem(MY_LOCATION_KEY)
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw) as Partial<MyLocation>
        if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number" || typeof parsed?.storey !== "number" || !parsed.buildingId)
            return null

        return { x: parsed.x, y: parsed.y, storey: parsed.storey, buildingId: parsed.buildingId }
    } catch {
        return null
    }
}

/** Persist (or clear, when given null) the saved location. */
export function saveMyLocation(loc: MyLocation | null): void {
    if (loc) localStorage.setItem(MY_LOCATION_KEY, JSON.stringify(loc))
    else localStorage.removeItem(MY_LOCATION_KEY)
}
