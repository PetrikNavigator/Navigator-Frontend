export type Axis = {
    label: "X" | "Y" | "Z" | "-X" | "-Y" | "-Z"
    color: string
    /** World-space unit vector for this axis tip. */
    dir: [number, number, number]
    /** Filled labelled disc on the + side, hollow ring on the −. */
    positive: boolean
}

export const AXES: Axis[] = [
    { label: "X", color: "#ef4444", dir: [1, 0, 0], positive: true },
    { label: "-X", color: "#ef4444", dir: [-1, 0, 0], positive: false },
    { label: "Y", color: "#22c55e", dir: [0, 1, 0], positive: true },
    { label: "-Y", color: "#22c55e", dir: [0, -1, 0], positive: false },
    { label: "Z", color: "#3b82f6", dir: [0, 0, 1], positive: true },
    { label: "-Z", color: "#3b82f6", dir: [0, 0, -1], positive: false },
]