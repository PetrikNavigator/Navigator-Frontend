import { useBuildings } from "../../contexts/navigator/BuildingContext";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClassroomType } from "../../contexts/navigator/ClassroomTypesContext";
import SidebarLink from "../SidebarLink";
import { useAuth } from "../../contexts/other/AuthContext";
import { useNavigate } from "react-router";

export default function ManagerSidebar() {
    const { t } = useTranslation()
    const { buildings, getBuildings } = useBuildings()
    const { classroom_types, getClassroomTypes } = useClassroomType()
    const { logout, isLoading } = useAuth();

    const navigate = useNavigate()

    const onLogout = async () => {
        await logout();
        navigate("/", { replace: true })
    }

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
                        text={t("ui.sidebar.overview")}
                        url=""
                        end />

                    <SidebarLink
                        text={t("ui.sidebar.buildings")}
                        url="epuletek" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text={t("ui.sidebar.classroom_types")}
                        url="teremtipusok" />

                    <SidebarLink
                        disabled={!hasBuildings || !hasClassroomTypes}
                        text={t("ui.sidebar.classrooms")}
                        url="termek" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text={t("ui.sidebar.lifts")}
                        url="liftek" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text={t("ui.sidebar.stairs")}
                        url="lepcsok" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text={t("ui.sidebar.corridors")}
                        url="folyosok" />

                    <SidebarLink
                        disabled={!hasBuildings}
                        text={t("ui.sidebar.preview")}
                        url="elonezet" />

                    <SidebarLink
                        text={t("ui.sidebar.translations")}
                        url="forditasok" />

                    <div className="mt-auto">
                        <button onClick={onLogout} className="btn btn-error mt-2 btn-sm w-full" disabled={isLoading}>
                            {t("ui.sidebar.logout")}
                        </button>
                    </div>
                </ul>
            </div>
        </>
    );
}
