import type { FullGraph } from "../types/FullGraph";
import { get_request } from "./requests";

export async function getFullGraph(): Promise<FullGraph> {
    try {
        const graph = await get_request<FullGraph>("/api/graph")

        return graph
    } catch (error: any) {
        throw new Error()
    }
}