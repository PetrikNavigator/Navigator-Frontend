import type { Lift, AddLift, UpdateLift } from "../types/navigator/Lift"
import { get_request, post_put_request, delete_request } from "./requests"



const PATH = "/api/lifts"

export async function getLifts(): Promise<Lift[]> {
    const lifts = await get_request<Lift[]>(PATH)

    return lifts
}

export async function addLift(body: AddLift): Promise<Lift> {
    const lift = await post_put_request<AddLift, Lift>("POST", PATH, body)

    return lift
}

export async function modifyLift(id: string, body: UpdateLift): Promise<Lift> {
    const lift = await post_put_request<UpdateLift, Lift>("PUT", PATH + `/${id}`, body)

    return lift
}

export async function deleteLift(lift_id: string): Promise<Lift> {
    const lift = await delete_request<Lift>(PATH + `/${lift_id}`)

    return lift
}
