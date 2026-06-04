import type { AddBuildingRequest, Building, UpdateBuildingRequest } from "../types/navigator/Building"
import { get_request, post_put_request, delete_request } from "./requests"

const PATH: string = "/api/buildings"

export async function getBuildings(): Promise<Building[]> {
    const buildings = await get_request<Building[]>(PATH)

    return buildings
}

export async function addBuilding(body: AddBuildingRequest): Promise<Building> {
    const building = await post_put_request<AddBuildingRequest, Building>("POST", PATH, body)

    return building
}

export async function modifyBuilding(id: string, body: UpdateBuildingRequest): Promise<Building> {
    const building: Building = await post_put_request<UpdateBuildingRequest, Building>("PUT", PATH + `/${id}`, body)

    return building
}

export async function deleteBuilding(building_id: string): Promise<Building> {
    const building = await delete_request<Building>(PATH + `/${building_id}`)

    return building
}