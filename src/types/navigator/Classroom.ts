export type DoorRotationType = number

export type Classroom = {
    id: string,
    capacity: number,
    storey: number,
    x: number,
    y: number,
    rotation: number,
    name: string,
    size_x: number,
    size_y: number,
    size_z: number,
    description: string,
    type_id: string,
    building_id: string,
}

export type AddClassroom = Omit<Classroom, "id">

export type UpdateClassroom = Partial<AddClassroom>