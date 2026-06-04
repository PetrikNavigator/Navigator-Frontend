import type { ClassroomType, AddClasroomType, UpdateClasroomType } from "../types/navigator/ClassroomType"
import { get_request, post_put_request, delete_request } from "./requests"



const PATH: string = "/api/classrooms-types"

export async function getClassroomTypes(premise_id: string): Promise<ClassroomType[]> {
    const classroom = await get_request<ClassroomType[]>(PATH + `?premise=${premise_id}`)

    return classroom
}

export async function addClassroomType(body: AddClasroomType): Promise<ClassroomType> {
    const classroom = await post_put_request<AddClasroomType, ClassroomType>("POST", PATH, body)

    return classroom
}

export async function modifyClassroomType(id: string, body: UpdateClasroomType): Promise<ClassroomType> {
    const classroom = await post_put_request<UpdateClasroomType, ClassroomType>("PUT", PATH + `/${id}`, body)

    return classroom
}

export async function deleteClassroomType(classroom_id: string): Promise<ClassroomType> {
    const classroom = await delete_request<ClassroomType>(PATH + `/${classroom_id}`)

    return classroom
}
