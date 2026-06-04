import { useAuth } from "../contexts/other/AuthContext";
import ManagerDashboard from "./ManagerDashboard";
import PublicDashboard from "./PublicDashboard";

export default function Dashboard() {
    const { user } = useAuth();

    if (user)
        return <ManagerDashboard />

    return <PublicDashboard />
}