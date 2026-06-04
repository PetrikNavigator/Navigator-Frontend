import type { Corridor, AddCorridor, UpdateCorridor } from "../types/navigator/Corridor"
import { get_request, post_put_request, delete_request } from "./requests"



const PATH: string = "/api/corridors"

export async function getCorridors(premise: string): Promise<Corridor[]> {
    const corridors = await get_request<Corridor[]>(PATH + `?premise=${premise}`)

    return corridors
}

export async function addCorridor(body: AddCorridor): Promise<Corridor> {
    const corridor = await post_put_request<AddCorridor, Corridor>("POST", PATH, body)

    return corridor
}

export async function modifyCorridor(id: string, body: UpdateCorridor): Promise<Corridor> {
    const corridor = await post_put_request<UpdateCorridor, Corridor>("PUT", PATH + `/${id}`, body)

    return corridor
}

export async function deleteCorridor(corridor_id: string): Promise<Corridor> {
    const corridor = await delete_request<Corridor>(PATH + `/${corridor_id}`)

    return corridor
}