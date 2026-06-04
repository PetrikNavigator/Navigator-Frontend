import axios from "axios"
import { normalizeError } from "./errors"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

export async function get_request<T>(path: string): Promise<T> {
    try {
        const response = await axiosInstance.get(path)

        return response.data as T
    } catch (error: unknown) {
        throw normalizeError(error)
    }
}

export async function post_put_request<T, R = T>(
    method: "POST" | "PUT" | "PATCH",
    path: string,
    body: T
): Promise<R> {
    try {
        const response = await axiosInstance.request({
            method: method,
            url: path,
            data: body
        })

        return response.data as R
    } catch (error: unknown) {
        throw normalizeError(error)
    }
}

export async function delete_request<T, R = T>(path: string, body?: T): Promise<R> {
    try {
        const response = await axiosInstance.delete(path, { data: body })

        return response.data as R
    } catch (error: unknown) {
        throw normalizeError(error)
    }
}
