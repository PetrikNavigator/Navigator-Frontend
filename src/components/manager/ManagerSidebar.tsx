import SidebarProfileButtons from "../SidebarProfileButtons";
import { useBuildings } from "../../contexts/navigator/BuildingContext";
import { useEffect } from "react";
import { useClassroomType } from "../../contexts/navigator/ClassroomTypesContext";
import SidebarLink from "../SidebarLink";

export default function ManagerSidebar() {
    const { buildings, getBuildings } = useBuildings()
    const { classroom_types, getClassroomTypes } = useClassroomType()

    useEffect(() => {
        getBuildings()
        getClassroomTypes()
    }, [])

    const hasBuildings = buildings.length > 0
    const hasClassroomTypes = classroom_types.length > 0

    return (
        <>
            <label
                htmlFor="sidebar-drawer"
                className="drawer-overlay"
            />

            <div className="bg-base-200 min-h-full w-72 flex flex-col">
                <ul className="menu flex-1 p-4 w-full">
                    <SidebarLink
                        text="Áttekintés"
                        url=""
                        end />

                    <SidebarLink
                        text="Épületek"
                        url="epuletek" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text="Terem típusok"
                        url="teremtipusok" />

                    <SidebarLink
                        disabled={!hasBuildings || !hasClassroomTypes}
                        text="Termek"
                        url="termek" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text="Liftek"
                        url="liftek" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text="Lépcsők"
                        url="lepcsok" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text="Folyosók"
                        url="folyosok" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text="3D Előnézet"
                        url="elonezet" />

                    <SidebarProfileButtons />
                </ul>
            </div>
        </>
    );
}
