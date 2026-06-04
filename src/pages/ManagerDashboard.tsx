import { Route, Routes } from "react-router";
import Layout from "../components/Layout";
import ManagerSidebar from "../components/manager/ManagerSidebar";
import ManagerMain from "../components/manager/ManagerMain";
import Preview from "../components/editor/Preview";
import BuildingsTable from "../components/editor/building/BuildingsTable";
import ClassroomsTab from "../components/editor/classroom/ClassroomsTab";
import ClassroomTypesTable from "../components/editor/classroom-types/ClassroomTypesTable";
import LiftsTab from "../components/editor/lift/LiftsTab";
import StairsTab from "../components/editor/stair/StairsTab";
import CorridorsTab from "../components/editor/corridor/CorridorsTab";

export default function ManagerDashboard() {
    return (
        <>
            <Layout
                sidebarItems={<ManagerSidebar />}
                navbarStart={<h2 className="text-center hidden sm:flex text-lg font-bold ms-2">Petrik App</h2>}>

                <Routes>
                    <Route path="/" element={<ManagerMain />} />
                    <Route path="/epuletek" element={<BuildingsTable />} />
                    <Route path="/teremtipusok" element={<ClassroomTypesTable />} />
                    <Route path="/termek" element={<ClassroomsTab />} />
                    <Route path="/liftek" element={<LiftsTab />} />
                    <Route path="/lepcsok" element={<StairsTab />} />
                    <Route path="/folyosok" element={<CorridorsTab />} />
                    <Route path="/elonezet" element={<Preview />} />
                </Routes>

            </Layout>
        </>
    )
}
