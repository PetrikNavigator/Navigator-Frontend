export type ClassroomType = {
    id: string,
    name: string,
    colorhex: string
}

export type AddClasroomType = Omit<ClassroomType, "id">

export type UpdateClasroomType = Partial<AddClasroomType>