import type { Classroom, AddClassroom, UpdateClassroom } from "../types/navigator/Classroom"
import { get_request, post_put_request, delete_request } from "./requests"



const PATH: string = "/api/classrooms"

export async function getClassrooms(premise: string): Promise<Classroom[]> {
    const classrooms = await get_request<Classroom[]>(PATH + `?premise=${premise}`)

    return classrooms
}

export async function addClassroom(body: AddClassroom): Promise<Classroom> {
    const classroom = await post_put_request<AddClassroom, Classroom>("POST", PATH, body)

    return classroom
}

export async function modifyClassroom(id: string, body: UpdateClassroom): Promise<Classroom> {
    const classroom = await post_put_request<UpdateClassroom, Classroom>("PUT", PATH + `/${id}`, body)

    return classroom
}

export async function deleteClassroom(classroom_id: string): Promise<Classroom> {
    const classroom = await delete_request<Classroom>(PATH + `/${classroom_id}`)

    return classroom
}
