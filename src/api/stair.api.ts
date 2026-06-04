import type { Stair, AddStair, UpdateStair } from "../types/navigator/Stair"
import { get_request, post_put_request, delete_request } from "./requests"


const PATH = "/api/stairs"

export async function getStairs(premise: string): Promise<Stair[]> {
    const stairs = await get_request<Stair[]>(PATH + `?premise=${premise}`)

    return stairs
}

export async function addStair(body: AddStair): Promise<Stair> {
    const stair = await post_put_request<AddStair, Stair>("POST", PATH, body)

    return stair
}

export async function modifyStair(id: string, body: UpdateStair): Promise<Stair> {
    const stair = await post_put_request<UpdateStair, Stair>("PUT", PATH + `/${id}`, body)

    return stair
}

export async function deleteStair(stair_id: string): Promise<Stair> {
    const stair = await delete_request<Stair>(PATH + `/${stair_id}`)

    return stair
}
