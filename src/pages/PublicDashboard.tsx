import Layout from "../components/Layout";
import PublicSidebar from "../components/public/PublicSidebar";

export default function PublicDashboard() {
    return (
        <>
            <Layout
                sidebarItems={<PublicSidebar />}
                navbarStart={<h2 className="text-center text-lg font-bold ms-2">Petrik App</h2>}>
            </Layout>
        </>
    )
}