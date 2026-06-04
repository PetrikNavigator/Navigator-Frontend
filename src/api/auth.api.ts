import type { LoginRequest } from "../types/request/LoginRequest"
import type { User } from "../types/User"
import { post_put_request, get_request } from "./requests"


const PATH: string = "/api/auth"

export async function api_login(body: LoginRequest): Promise<User> {
    return await post_put_request<LoginRequest, User>("POST", PATH + "/login", body)
}

export async function api_logout(): Promise<void> {
    await post_put_request<object>("POST", PATH + "/logout", {})
}

export async function api_getMe(): Promise<User> {
    const me = await get_request<User>(PATH + "/me")

    return me
}