export type Lift = {
    id: string,
    name: string,
    x: number,
    y: number,
    min_storey: number,
    max_storey: number,
    building_id: string,
}

export type AddLift = Omit<Lift, "id">

export type UpdateLift = Partial<AddLift>