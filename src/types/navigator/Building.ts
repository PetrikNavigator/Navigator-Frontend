export type Building = {
    id: string,
    name: string,
    description: string,
    x: number,
    y: number
}

export type AddBuildingRequest = Omit<Building, "id">

export type UpdateBuildingRequest = Partial<AddBuildingRequest>