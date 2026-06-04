import type { FullGraph } from "../types/FullGraph";
import { get_request } from "./requests";

const PATH: string = "/api"

//-----------------------------------------------------------------------------------------------
//------------------------------------------ NAVIGATOR ------------------------------------------
//-----------------------------------------------------------------------------------------------

export async function getFullGraph(premise: string): Promise<FullGraph> {
    try {
        const graph = await get_request<FullGraph>(`${PATH}/navigator/graph?premise=${premise}`)

        return graph
    } catch (error: any) {
        throw new Error()
    }
}