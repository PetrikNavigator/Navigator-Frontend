import type { FullGraph } from "../types/FullGraph";
import { get_request } from "./requests";

const PATH: string = "/api"

export async function getFullGraph(): Promise<FullGraph> {
    try {
        const graph = await get_request<FullGraph>(`${PATH}/navigator/graph`)

        return graph
    } catch (error: any) {
        throw new Error()
    }
}