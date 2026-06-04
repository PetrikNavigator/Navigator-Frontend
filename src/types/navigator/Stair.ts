import type { Lift } from "./Lift"

export type Stair = Lift & { rotation: number }

export type AddStair = Omit<Stair, "id">

export type UpdateStair = Partial<AddStair>