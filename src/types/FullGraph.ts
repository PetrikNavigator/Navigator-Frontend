import type { Building } from "./navigator/Building"
import type { Classroom } from "./navigator/Classroom"
import type { ClassroomType } from "./navigator/ClassroomType"
import type { Corridor } from "./navigator/Corridor"
import type { Lift } from "./navigator/Lift"
import type { Stair } from "./navigator/Stair"

export type FullGraph = {
    buildings: Building[],
    classrooms: Classroom[],
    classroom_types: ClassroomType[],
    lifts: Lift[],
    stairs: Stair[],
    corridors: Corridor[]
}
